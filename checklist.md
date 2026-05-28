# 체크리스트

- [x] 프로젝트 구조와 문서 요구사항 확인.
- [x] React 18, TypeScript, Vite, Tailwind CSS 구성.
- [x] React Router DOM v6 라우팅 구성.
- [x] shadcn/ui 스타일 공통 컴포넌트와 레이아웃 구성.
- [x] `public/data/routes/*.json` 더미 데이터 작성.
- [x] 대시보드 화면 구현.
- [x] 규칙 목록 화면 구현.
- [x] 새 규칙 생성 화면 구현.
- [x] 규칙 상세와 수정 화면 구현.
- [x] 수신 로그 화면 구현.
- [x] 발송 로그 화면 구현.
- [x] 테스트 매칭 화면 구현.
- [x] 각 페이지의 loading, success, empty, error 상태 전이 구현.
- [x] Sonner 토스트, Framer Motion 진입 애니메이션 적용.
- [x] 빌드 검증.
- [x] 브라우저 화면과 핵심 흐름 검증.
- [x] 논리 단위 커밋 생성.

## 추가 체크리스트. 다크모드와 라이트모드

- [x] 기존 테마 설정과 레이아웃 구조 확인.
- [x] 다크모드 CSS 변수 추가.
- [x] 전역 테마 상태와 저장 로직 추가.
- [x] 헤더에 라이트/다크 토글 UI 추가.
- [x] 빌드 검증.
- [x] 브라우저에서 라이트/다크 전환 확인.
- [x] 논리 단위 커밋 생성.

## 추가 체크리스트. Supabase MCP 연결

- [x] 공식 Supabase MCP 설정 방식 확인.
- [x] 기존 Codex MCP 설정 확인.
- [x] Supabase MCP 서버를 read-only로 등록.
- [x] `SUPABASE_ACCESS_TOKEN` bearer token 환경변수 연결.
- [x] `codex mcp get supabase`로 등록 상태 확인.
- [x] 논리 단위 커밋 생성.

## 추가 체크리스트. Supabase DB 초기 구축

- [x] `schema.sql`, `seed_data.sql`, `ERD.md`, `IA.md` 읽기.
- [x] 원격 Supabase의 기존 테이블 상태 확인.
- [x] MCP 쓰기 가능 설정 확인 또는 전환.
- [x] `schema.sql`을 Supabase에 적용.
- [x] 생성 테이블, 컬럼, FK, 인덱스를 ERD/IA와 교차검증.
- [x] `seed_data.sql`을 Supabase에 적용.
- [x] 규칙, 수신 로그, 발송 로그, 설정 데이터 건수 검증.
- [x] 작업 기록 커밋.

## 추가 체크리스트. Supabase Edge Function 배포

- [x] `edge-function-guide-v3.md` 섹션 6-A, 6-B 코드 확인.
- [x] `instagram-webhook`을 `verify_jwt=false`로 배포.
- [x] `test-match`를 `verify_jwt=false`로 배포.
- [x] 배포된 Edge Function 목록과 URL 확인.
- [x] 작업 기록 커밋.

## 추가 체크리스트. GitHub 푸시와 프롬프트 보관

- [x] 현재 브랜치와 원격 저장소 상태 확인.
- [x] 사용자 텍스트 프롬프트 보관 문서 생성.
- [x] `edge-function-guide-v3.md` 포함 여부 확인.
- [x] 민감정보 패턴 검색.
- [x] 빌드와 diff 검증.
- [x] 보관 문서와 작업 기록 커밋.
- [x] `origin/main`으로 푸시.

## 추가 체크리스트. README 작성

- [x] 기존 README와 프로젝트 문서 확인.
- [x] 구현된 라우트와 파일 구조 확인.
- [x] README 본문 작성.
- [x] 민감정보가 포함되지 않았는지 확인.
- [x] 문서 diff 검증.
- [x] 작업 기록 커밋.
