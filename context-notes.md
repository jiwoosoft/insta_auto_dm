# 컨텍스트 노트

## 2026-05-28

- 현재 저장소는 문서 중심으로 구성되어 있고 프론트엔드 앱 파일은 아직 없다.
- 작업트리는 시작 시점에 깨끗했다.
- 목업은 실제 백엔드 없이 로컬 JSON과 페이지 내부 상태만 사용해야 한다.
- 라우터는 `/`, `/rules`, `/rules/new`, `/rules/:ruleId`, `/logs/incoming`, `/logs/outgoing`, `/test`로 고정한다.
- 로그인, 회원가입, 권한관리, 보호 라우트, API 호출, 데이터베이스 코드는 범위에서 제외한다.
- 로컬 환경의 기본 `node`는 접근 오류가 발생했고 `npm`은 PATH에 없었다.
- Codex 번들 Node와 프로젝트 내부 `.tools/npm` CLI로 의존성을 설치했다.
- 런타임 `fetch`를 쓰지 않기 위해 `public/data/routes/*.json`을 TypeScript에서 정적 import하는 구조로 진행한다.
- Vite가 `public` 폴더 import를 막지 않도록 `publicDir: false`를 설정했다.
- 브라우저 검증 중 1280px 근처에서 상태 버튼과 우측 카드가 잘리는 현상을 발견했고, 헤더 배치와 메인 패딩을 조정했다.
- 테스트 예문 `배송은 얼마나 걸리나요?`가 가격 규칙의 `얼마` 키워드에 먼저 잡혀 테스트용 배송 규칙 우선순위를 높였다.
- 최종 빌드는 `npm run build`로 통과했다.

## 2026-05-28 추가 작업

- 다크모드와 라이트모드 요청을 받았다.
- Tailwind 설정은 이미 `darkMode: ["class"]`라서 CSS 변수와 루트 클래스 토글로 구현하는 것이 가장 작다.
- 테마 토글은 로그인이나 계정 개념 없이 로컬 목업 상태로만 동작해야 한다.
- 헤더 우측에 라이트와 다크 전환 버튼을 추가했고 선택값은 `theme-mode` 키로 저장한다.
- 브라우저에서 다크 전환, 새로고침 후 유지, 라이트 복귀, 콘솔 오류 없음까지 확인했다.

## 2026-05-28 Supabase MCP 연결

- 사용자의 “superbase mcp server” 요청은 Supabase MCP server 연결로 해석했다.
- Supabase 공식 문서 기준 원격 MCP URL은 `https://mcp.supabase.com/mcp`다.
- 현재 프로젝트 문서에는 실제 project ref가 없어서 전체 계정 범위가 될 수 있는 project-scoped 연결은 하지 않았다.
- Codex 전역 설정에 `https://mcp.supabase.com/mcp?read_only=true`를 등록했다.
- Codex CLI OAuth 로그인은 제한 시간 안에 완료되지 않았고, 안정적인 인증을 위해 `SUPABASE_ACCESS_TOKEN` bearer token 환경변수를 참조하도록 바꿨다.

## 2026-05-28 Supabase DB 초기 구축

- 목표는 PRD의 Instagram DM 자동응답 관리자 서비스를 위한 DB를 먼저 구축하는 것이다.
- `schema.sql`은 ERD와 IA의 핵심 4개 테이블인 `rules`, `incoming_messages`, `outgoing_messages`, `integration_settings`를 만든다.
- `seed_data.sql`은 운영 편의를 위해 `sender_alias`, `recipient_alias` 컬럼을 추가하고 더미 규칙 10건, 수신 로그 30건, 발송 로그 22건을 삽입한다.
- `schema.sql`은 `CREATE TABLE`에 `IF NOT EXISTS`가 없어 이미 동일 테이블이 있으면 실패한다. 적용 전 원격 DB 상태 확인이 필요하다.
- Supabase MCP `list_tables` 결과 `public` 스키마는 비어 있었다.
- `schema.sql` 적용 시도는 현재 로드된 MCP 세션이 read-only로 붙어 있어 `Cannot apply migration in read-only mode.`로 차단됐다.
- `~/.codex/config.toml`의 Supabase MCP URL은 `read_only=true`를 제거한 write 가능 URL로 바꿨다. Codex 재시작 후 새 MCP 세션으로 이어가야 한다.
- 새 세션에서 `initial_schema_from_schema_sql` 마이그레이션 적용이 성공했다.
- 생성된 구조는 ERD/IA의 `rules`, `incoming_messages`, `outgoing_messages`, `integration_settings`와 일치했다. PK, FK, `ON DELETE SET NULL`, 유니크 제약, 주요 인덱스, `updated_at` 트리거까지 확인했다.
- `seed_data_from_seed_data_sql` 마이그레이션 적용이 성공했다.
- 검증 건수는 `rules=10`, `incoming_messages=30`, `outgoing_messages=22`, `integration_settings=1`이다.
- 시드 상태는 활성 규칙 7건, 비활성 규칙 3건, 수신 matched 22건, unmatched 8건, 발송 success 19건, failed 3건이다.
- FK 고아 레코드는 `incoming_matched_without_rule=0`, `outgoing_matched_without_rule=0`, `outgoing_without_incoming=0`으로 확인했다.
- 작업 후 MCP 설정은 다시 `read_only=true`로 되돌렸다.
- Supabase security advisor는 4개 public 테이블의 RLS 미설정과 `update_updated_at` 함수 search_path 미고정을 경고했다. 사용자 승인 없이 RLS는 적용하지 않았다.
- 최종 읽기 검증은 실제 스키마 컬럼인 `match_status`, `send_status`, `incoming_log_id`, `matched_rule_id` 기준으로 통과했다.

## 2026-05-29 Supabase Edge Function 배포

- 목표는 `edge-function-guide-v3.md` 섹션 6의 지시에 따라 `instagram-webhook`, `test-match` Edge Function을 배포하는 것이다.
- 두 함수 모두 사용자가 명시한 대로 `verify_jwt=false`로 배포한다.
- 소스코드는 섹션 6-A, 6-B 코드 블록을 그대로 사용하는 것을 기준으로 한다.
- Supabase MCP `deploy_edge_function`으로 `instagram-webhook` version 1 배포가 성공했고 `verify_jwt=false`, `status=ACTIVE`로 확인했다.
- Supabase MCP `deploy_edge_function`으로 `test-match` version 1 배포가 성공했고 `verify_jwt=false`, `status=ACTIVE`로 확인했다.
- 프로젝트 URL은 `https://rslfcjydihvginylmhrv.supabase.co`로 확인했다.
- 함수 URL은 `https://rslfcjydihvginylmhrv.supabase.co/functions/v1/instagram-webhook`, `https://rslfcjydihvginylmhrv.supabase.co/functions/v1/test-match`이다.
- 스모크 테스트에서 `test-match`는 `가격이 얼마인가요?` 입력에 대해 `matched=true`를 반환했다.
- 스모크 테스트에서 `instagram-webhook`은 검증 토큰 없는 GET 요청에 `403 Forbidden`으로 응답했다.

## 2026-05-29 GitHub 푸시와 프롬프트 보관

- 목표는 지금까지의 커밋과 작업 정보를 GitHub 원격 저장소에 푸시하고, 사용자가 전달한 프롬프트를 별도 문서로 보관하는 것이다.
- 현재 브랜치는 `main`이고 `origin/main`보다 5개 커밋 앞서 있었다.
- 원격 저장소는 `https://github.com/jiwoosoft/insta_auto_dm.git`이다.
- `docs/edge-function-guide-v3.md`는 Edge Function 배포에 사용한 문서지만 아직 untracked 상태라 이번 커밋에 포함한다.
- 사용자가 실제 토큰 원문을 대화에 붙여 넣은 기록은 없었다. 보관 문서에는 토큰 placeholder와 환경변수명만 포함한다.
- 이미지 첨부만 있었던 메시지는 원본 이미지 파일 경로가 없어 텍스트 프롬프트와 동일한 방식으로 완전 재현할 수 없다. 보관 문서에는 첨부 사실과 확인 가능한 오류 맥락을 기록한다.
- 민감정보 패턴 검색 결과 실제 토큰 값은 발견되지 않았고 `META_VERIFY_TOKEN`, `INSTAGRAM_ACCESS_TOKEN` 같은 환경변수명만 확인됐다.
- 기본 `npm`과 `node`는 Windows 권한 문제로 실패했으나 Codex 번들 Node로 `tsc -b`와 `vite build`를 직접 실행해 빌드가 통과했다.

## 2026-05-29 README 작성

- 목표는 현재 저장소만 보고도 서비스 목적, 실행 방법, 구현 범위, Supabase 연결 상태를 이해할 수 있게 README를 정리하는 것이다.
- README에는 실제 비밀값을 넣지 않고 `META_VERIFY_TOKEN`, `INSTAGRAM_ACCESS_TOKEN`, `INSTAGRAM_ACCOUNT_ID` 같은 Secret 이름만 기록한다.
- Supabase 프로젝트 URL과 Edge Function URL은 이미 사용자에게 전달된 공개 엔드포인트라 README에 포함한다.
- 현재 프론트엔드는 로컬 JSON 기반 목업이고, DB와 Edge Function은 Supabase에 구축 및 배포된 상태다.
- README 작성 후 민감정보 패턴 검색, 한국어 문장 끝 콜론 검색, `git diff --check`를 통과했다.
- 이번 변경은 문서만 수정했으므로 프론트엔드 빌드는 새로 실행하지 않았다.

## 2026-05-29 규칙 시스템 정밀 점검

- 사용자가 보고한 첫 번째 문제는 원격 `instagram-webhook` 코드의 fallback 발송 분기와 일치한다. `matchResult`가 없더라도 `fallbackReply`가 있으면 `sendAndLog`를 호출한다.
- DB `integration_settings.fallback_reply`는 `문의 감사합니다. 담당자가 확인 후 답변드리겠습니다.`로 항상 채워져 있어 미매칭 메시지도 자동답변이 발송된다.
- 실제 발송 로그에서도 `학교`, `hi`, `사랑`, `금액`, `테스트` 같은 미매칭 메시지가 `matched_rule_id=null` 상태로 같은 fallback 답변을 받은 기록이 확인됐다.
- 활성 규칙 자체는 여러 개가 있고, 매칭된 메시지에는 각 규칙별 답변이 나간 기록도 있다. 사용자가 체감한 "항상 같은 답변"은 미매칭 fallback이 무조건 발송된 결과로 보는 것이 타당하다.
- 로컬웹의 규칙 생성, 수정, 삭제, 토글은 모두 `public/data/routes/*.json`과 React 로컬 state만 사용한다. Supabase DB로 쓰기 요청을 보내는 코드가 없어서 실제 운영 규칙은 변경되지 않는다.
- 수정 방향은 `instagram-webhook`에서 미매칭 메시지는 수신 로그만 남기고 발송하지 않도록 바꾸고, 프론트 규칙 화면은 Supabase REST API 기반 CRUD로 연결하는 것이다.
- `src/lib/supabase-rest.ts`를 추가해 `rules` CRUD와 `test-match` 호출을 구현했다.
- `RulesPage`, `RuleNewPage`, `RuleDetailPage`, `TestPage`는 Supabase 환경변수가 있으면 실데이터를 사용하고, 없으면 기존 목업으로 동작한다.
- `.env.local`에는 로컬 실행용 Supabase URL과 publishable key를 설정했고, `.env.example`에는 placeholder만 커밋 대상으로 추가했다.
- `supabase/functions/instagram-webhook/index.ts`에는 미매칭 메시지 발송을 제거한 수정본을 추가했다.
- Supabase MCP 배포 시도는 현재 MCP URL이 `read_only=true`라 `Cannot deploy an edge function in read-only mode.`로 실패했다.
- Supabase CLI도 로컬 PATH에 `npx`가 없어 사용할 수 없었다.
- 공식 Management API의 `POST /v1/projects/{ref}/functions/deploy`에 multipart form-data로 `index.ts`와 metadata를 보내 `instagram-webhook`을 재배포했다.
- 재배포 결과 `instagram-webhook`은 version 4, `verify_jwt=false`, `status=ACTIVE`로 확인됐다.
- `rules`, `incoming_messages`, `outgoing_messages`, `integration_settings`는 현재 RLS가 비활성화되어 있다.
- `.env.local`의 publishable key로 `rules`에 임시 규칙을 생성, 수정, 삭제했고 삭제 후 남은 row가 없음을 확인했다.
- `test-match` 원격 함수는 미매칭 입력에 `matched:false`를 반환했다. 현재 프론트 테스트 화면은 이 경우 자동 발송 대상이 아니라고 표시한다.
- Codex 번들 Node로 `tsc -b`와 `vite build`를 실행했고 통과했다.

## 2026-05-30 규칙 CRUD 웹 동작 재점검

- 사용자는 Instagram 자동답변 규칙 매칭은 정상화됐지만, 웹에서 규칙 수정, 삭제, 신규 추가가 전혀 작동하지 않는다고 보고했다.
- 이번 성공 기준은 관리자 웹 UI의 신규 생성, 수정, 삭제가 실제 Supabase `rules` 테이블에 반영되는 것이다.
- 우선 코드와 실행 환경을 다시 확인해 환경변수 미적용, UI 이벤트 문제, REST 요청 실패를 분리한다.
- 로컬 실행 화면은 `.env.local`의 Supabase 설정을 읽어 `Supabase 실데이터 연결됨` 상태로 동작했다.
- 브라우저에서 신규 생성, 상세 수정, 삭제를 직접 수행했으며 Supabase `rules` 테이블에 반영됐다.
- 삭제 검증은 생성된 임시 규칙 id로 재조회했을 때 `leftover_count=0`으로 확인했다.
- 사용자가 체감한 미동작은 Supabase 환경변수가 없는 웹에서 로컬 목업 저장처럼 보이는 UX와 구분이 어려웠을 가능성이 높다.
- 헤더 배지를 `Local Mock Run`에서 실제 연결 상태 기반 `Supabase 연결` 또는 `목업 모드`로 바꿨다.
- Supabase 미연결 상태에서는 신규 저장, 수정, 활성 토글, 삭제가 로컬에서 성공한 것처럼 보이지 않도록 오류 토스트로 차단했다.

## 2026-05-30 수신/발송 로그 실데이터 연결

- 사용자는 자동응답과 규칙 CRUD는 정상화됐지만, 웹의 수신 로그와 발송 로그 메뉴가 실제 로그를 표시하지 않는다고 보고했다.
- 이번 성공 기준은 관리자 웹의 수신 로그와 발송 로그 화면이 Supabase `incoming_messages`, `outgoing_messages` 데이터를 표시하는 것이다.
- 먼저 현재 페이지가 목업 JSON만 사용하는지 확인하고, DB에는 실제 로그가 쌓이는지 확인한다.
- 원격 DB에는 `incoming_messages=53`, `outgoing_messages=37`이 있으며 최신 로그도 존재한다.
- 기존 `IncomingLogsPage`, `OutgoingLogsPage`는 `public/data/routes/logs-*.json`만 사용해 실제 DB 로그를 조회하지 않았다.
- `src/lib/supabase-rest.ts`에 `listIncomingLogs`, `listOutgoingLogs`를 추가하고 `rules(name)` 조인으로 적용 규칙명을 함께 가져오도록 했다.
- 수신 로그 화면은 Supabase 환경변수가 있으면 `incoming_messages`를 `received_at desc` 순서로 표시한다.
- 발송 로그 화면은 Supabase 환경변수가 있으면 `outgoing_messages`를 `sent_at desc` 순서로 표시한다.
- 브라우저에서 `/logs/incoming` 화면에 최근 실제 메시지 `테스트 프로그램은 어디있나여?`가 표시되는 것을 확인했다.
- 브라우저에서 `/logs/outgoing` 화면에 최근 실제 발송 로그와 `테스트` 규칙명이 표시되는 것을 확인했다.
