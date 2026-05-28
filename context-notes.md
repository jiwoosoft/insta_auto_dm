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
