# 프론트엔드 목업 구현 계획

## 목표

`docs/PRD.md`, `docs/front_mockup_docs/router-design.md`, `docs/front_mockup_docs/frontend-mockup-prompt.md`를 기준으로 Instagram DM 자동응답 관리자용 프론트엔드 목업을 완결 수준으로 구현한다.

## 범위

- React 18, TypeScript, Vite 기반 앱을 구성한다.
- React Router DOM v6로 7개 라우트를 명시적으로 연결한다.
- Tailwind CSS와 shadcn/ui 스타일 컴포넌트로 관리자형 UI를 구성한다.
- Framer Motion, Lucide React, Sonner를 사용한다.
- 모든 화면은 `public/data/routes/*.json` 더미 데이터와 로컬 상태만 사용한다.
- 로그인, 인증, API, DB, 외부 요청 코드는 만들지 않는다.

## 검증

- `npm run build`로 타입 검사와 번들 생성을 확인한다.
- 로컬 개발 서버에서 주요 라우트와 핵심 인터랙션을 브라우저로 확인한다.

## 추가 작업. 다크모드와 라이트모드

- 앱 전역에서 `.dark` 클래스로 테마를 전환한다.
- 헤더 우측에 현재 테마를 바꾸는 토글 버튼을 추가한다.
- 선택한 테마는 `localStorage`에 저장하고 다음 방문에도 유지한다.
- 라이트와 다크 상태 모두 브라우저에서 확인한다.

## 추가 작업. Supabase MCP 연결

- 공식 Supabase MCP 문서를 기준으로 원격 MCP 서버 URL을 확인한다.
- Codex 전역 MCP 설정에 Supabase 서버를 추가한다.
- 실제 프로젝트 ref가 아직 없으므로 `read_only=true`로 먼저 연결한다.
- PAT 기반 인증을 위해 `SUPABASE_ACCESS_TOKEN` 환경변수 참조를 설정한다.
- `codex mcp get supabase`로 등록 상태를 확인한다.
