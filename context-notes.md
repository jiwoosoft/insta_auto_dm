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
