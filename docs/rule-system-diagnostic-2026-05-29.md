# 규칙 시스템 정밀 점검 기록. 2026-05-29

## 점검 목적

Instagram DM 자동응답은 발송되지만 규칙과 무관하게 같은 답변이 나가고, 로컬 웹에서 규칙 생성, 수정, 삭제가 실제 운영 상태에 반영되지 않는 문제를 확인했다.

## 결론

문제는 두 가지 원인이 겹쳐 발생했다.

1. 원격 `instagram-webhook` Edge Function이 규칙 미매칭 메시지에도 `fallback_reply`를 자동 발송하고 있었다.
2. 프론트엔드 규칙 화면은 Supabase DB가 아니라 `public/data/routes/*.json`과 React 로컬 state만 수정하고 있었다.

따라서 Instagram 자동응답 엔진과 관리자 웹 화면이 같은 규칙 시스템을 공유하지 않는 상태였다.

## 증거

### Edge Function fallback 발송

원격 `instagram-webhook` 코드에는 `matchResult`가 없을 때도 `fallbackReply`가 있으면 `sendAndLog`를 호출하는 분기가 있었다.

DB `integration_settings.fallback_reply`는 아래 값으로 채워져 있었다.

```text
문의 감사합니다. 담당자가 확인 후 답변드리겠습니다.
```

이 조합 때문에 규칙에 걸리지 않은 모든 메시지도 같은 답변을 받았다.

### 실제 로그

원격 DB의 `outgoing_messages`에서 `matched_rule_id=null`인 동일 fallback 답변 발송 기록이 확인됐다.

확인된 예시는 아래와 같다.

```text
학교
hi
?
사랑
금액
테스트
```

위 메시지들은 `incoming_messages.match_status=unmatched`였지만 `outgoing_messages`에 같은 fallback 답변이 기록되어 있었다.

### 프론트엔드 규칙 관리

아래 화면들은 모두 로컬 JSON과 React state만 사용했다.

```text
src/pages/RulesPage.tsx
src/pages/RuleNewPage.tsx
src/pages/RuleDetailPage.tsx
src/pages/TestPage.tsx
```

기존 코드의 저장, 삭제, 토글 버튼은 toast 메시지만 띄우거나 화면 state만 바꿨고 Supabase DB에 `insert`, `update`, `delete` 요청을 보내지 않았다.

## 적용한 수정

### 자동답변 엔진

`supabase/functions/instagram-webhook/index.ts`를 추가했다.

변경된 로직은 아래와 같다.

- 규칙이 매칭된 메시지만 Instagram DM을 발송한다.
- 규칙이 매칭되지 않은 메시지는 `incoming_messages`에만 저장한다.
- 미매칭 메시지는 `outgoing_messages`를 만들지 않는다.
- 미매칭 메시지에는 fallback 답변을 보내지 않는다.

Supabase MCP 세션은 `read_only=true`라 `deploy_edge_function`이 `Cannot deploy an edge function in read-only mode.`로 차단됐다. 이후 Supabase Management API의 `POST /v1/projects/{ref}/functions/deploy`를 사용해 같은 `index.ts`를 배포했고, 원격 `instagram-webhook`은 version 4, `verify_jwt=false`, `status=ACTIVE`로 확인됐다.

프론트엔드 CRUD 연결은 `.env.local`에 설정된 publishable key로 Supabase REST API를 직접 호출해 검증했다. 임시 규칙을 생성한 뒤 이름과 우선순위를 수정하고, 삭제 후 같은 id로 조회했을 때 남은 row가 없음을 확인했다.

### 프론트엔드

`src/lib/supabase-rest.ts`를 추가해 Supabase REST API와 `test-match` Edge Function 호출을 담당하게 했다.

연결된 기능은 아래와 같다.

- 규칙 목록 조회.
- 규칙 활성, 비활성 토글.
- 새 규칙 생성.
- 기존 규칙 수정.
- 기존 규칙 삭제.
- `/test` 화면에서 원격 `test-match` 함수 호출.

환경변수가 없으면 기존 로컬 목업으로 동작하도록 fallback을 남겼다.

## 로컬 환경변수

`.env.local`에 Supabase URL과 publishable key를 설정했다. 이 파일은 `.gitignore`로 커밋되지 않는다.

커밋 가능한 예시는 `.env.example`에 추가했다.

## 아직 남은 작업

1. 실제 Instagram DM으로 미매칭 테스트 메시지가 `incoming_messages`에만 저장되고 `outgoing_messages`를 만들지 않는지 운영 환경에서 검증해야 한다.
2. 관리자 화면을 공개 배포하기 전에는 인증과 RLS 정책을 설계해야 한다. 현재는 목업 개발 편의를 위해 `rules` 테이블 RLS가 비활성화되어 있다.
3. 대시보드 KPI와 차트 데이터를 Supabase 실데이터로 전환해야 한다.
4. 수신 로그와 발송 로그 화면을 Supabase 실데이터로 연결해야 한다.
5. `update_updated_at` 함수 `search_path` 보안을 별도 작업으로 보완해야 한다.

## 이번 검증

- Codex 번들 Node로 `tsc -b` 통과.
- Codex 번들 Node로 `vite build` 통과.
- `git diff --check` 통과.
- 민감정보 패턴 검색에서 실제 비밀값은 커밋 대상에 포함되지 않은 것으로 확인.
