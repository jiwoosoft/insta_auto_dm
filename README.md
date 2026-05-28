# Instagram DM Auto Reply Admin

Instagram DM으로 들어오는 반복 문의를 키워드 기반 규칙으로 자동 분류하고, 운영자가 규칙과 로그를 관리할 수 있게 만든 단독 운영형 관리자 도구입니다.

현재 저장소에는 React 프론트엔드 목업, Supabase DB 설계와 시드 데이터, Supabase Edge Function 배포 가이드와 작업 기록이 포함되어 있습니다.

## 현재 상태

| 영역 | 상태 |
|---|---|
| 프론트엔드 목업 | 구현 완료 |
| 라이트모드와 다크모드 | 구현 완료 |
| Supabase DB 스키마 | 원격 프로젝트에 적용 완료 |
| Supabase 시드 데이터 | 원격 프로젝트에 적용 완료 |
| Edge Function 배포 | `instagram-webhook`, `test-match` 배포 완료 |
| Meta 실제 Webhook 연결 | Secret 등록과 Meta 대시보드 설정 필요 |
| 프론트엔드와 Supabase 실데이터 연결 | 다음 단계 작업 |

## 주요 기능

- 자동응답 규칙 목록 조회와 검색.
- 새 규칙 생성 화면 목업.
- 규칙 상세와 수정 화면 목업.
- 수신 DM 로그 조회 화면 목업.
- 자동응답 발송 로그 조회 화면 목업.
- 테스트 문장으로 규칙 매칭 결과 확인.
- 라이트모드와 다크모드 전환 및 로컬 저장.

## 기술 스택

- React 18.
- TypeScript.
- Vite.
- React Router DOM v6.
- Tailwind CSS.
- shadcn/ui 스타일 컴포넌트.
- Lucide React.
- Framer Motion.
- Sonner.
- Supabase Postgres.
- Supabase Edge Functions.

## 로컬 실행

Node.js와 npm이 설치된 일반 개발 환경에서는 아래 명령을 사용합니다.

```powershell
npm install
npm run dev
```

개발 서버는 기본적으로 `http://127.0.0.1:5173`에서 실행됩니다.

프로덕션 빌드는 아래 명령으로 확인합니다.

```powershell
npm run build
```

이 Codex 데스크톱 환경에서는 기본 `node`와 `npm` 실행 권한 문제가 있을 수 있습니다. 그 경우 Codex 번들 Node로 아래처럼 직접 실행했습니다.

```powershell
& 'C:\Users\d2fre\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' 'node_modules\typescript\bin\tsc' -b
& 'C:\Users\d2fre\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' 'node_modules\vite\bin\vite.js' build
```

## 라우트

| 경로 | 화면 |
|---|---|
| `/` | 대시보드 |
| `/rules` | 규칙 목록 |
| `/rules/new` | 새 규칙 생성 |
| `/rules/:ruleId` | 규칙 상세와 수정 |
| `/logs/incoming` | 수신 로그 |
| `/logs/outgoing` | 발송 로그 |
| `/test` | 테스트 매칭 |

## 데이터와 목업 구조

프론트엔드는 현재 실제 API 호출 없이 로컬 JSON 데이터를 사용합니다.

```text
public/data/routes/
  dashboard.json
  rules.json
  rule-new.json
  rule-detail.json
  logs-incoming.json
  logs-outgoing.json
  test.json
```

Vite 설정은 `publicDir: false`를 사용하며, 화면 데이터는 TypeScript 정적 import 방식으로 로드합니다.

## Supabase DB

초기 DB 구조는 [docs/db_docs/schema.sql](docs/db_docs/schema.sql)에 정의되어 있습니다. 시드 데이터는 [docs/db_docs/seed_data.sql](docs/db_docs/seed_data.sql)에 있습니다.

구축된 핵심 테이블은 아래와 같습니다.

| 테이블 | 역할 |
|---|---|
| `rules` | 자동응답 규칙 |
| `incoming_messages` | Instagram DM 수신 로그 |
| `outgoing_messages` | 자동응답 발송 로그 |
| `integration_settings` | 기본 응답, 중복 방지, 테스트 모드 같은 전역 설정 |

원격 Supabase 검증 결과는 아래 상태였습니다.

| 항목 | 값 |
|---|---:|
| `rules` | 10 |
| `incoming_messages` | 30 |
| `outgoing_messages` | 22 |
| `integration_settings` | 1 |

## Supabase Edge Functions

Supabase 프로젝트 URL입니다.

```text
https://rslfcjydihvginylmhrv.supabase.co
```

배포된 Edge Function URL입니다.

| 함수 | URL |
|---|---|
| `instagram-webhook` | `https://rslfcjydihvginylmhrv.supabase.co/functions/v1/instagram-webhook` |
| `test-match` | `https://rslfcjydihvginylmhrv.supabase.co/functions/v1/test-match` |

두 함수 모두 `verify_jwt=false`로 배포되어 있습니다. `instagram-webhook`은 Meta Webhook 검증 요청을 받아야 하므로 JWT 검증을 끈 상태입니다. `test-match`는 관리자 화면에서 테스트 매칭 API로 연결할 예정입니다.

Edge Function 원본 코드는 [docs/edge-function-guide-v3.md](docs/edge-function-guide-v3.md)의 섹션 6-A와 6-B를 기준으로 배포했습니다.

## 필요한 Supabase Secrets

Meta 실제 연결 전 Supabase 대시보드의 Edge Function Secrets에 아래 값을 등록해야 합니다.

| Secret 이름 | 설명 |
|---|---|
| `META_VERIFY_TOKEN` | Meta Webhook 검증에 사용할 임의 문자열 |
| `INSTAGRAM_ACCESS_TOKEN` | Instagram API 호출용 액세스 토큰 |
| `INSTAGRAM_ACCOUNT_ID` | 자동응답 대상 Instagram 계정 ID |

`SUPABASE_URL`과 `SUPABASE_SERVICE_ROLE_KEY`는 Supabase Edge Function 런타임에서 자동 주입되는 값으로 별도 등록하지 않습니다.

## 보안 주의사항

- 실제 토큰, 서비스 역할 키, 개인 액세스 토큰은 저장소에 커밋하지 않습니다.
- 현재 Supabase advisor는 public 테이블의 RLS 미설정을 경고했습니다.
- RLS는 정책 없이 켜면 프론트엔드와 Edge Function 접근이 막힐 수 있으므로 별도 정책 설계 후 적용해야 합니다.
- `public.update_updated_at` 함수의 `search_path` 고정도 후속 보안 작업으로 남아 있습니다.

## 주요 문서

| 문서 | 내용 |
|---|---|
| [docs/PRD.md](docs/PRD.md) | 서비스 요구사항과 제품 범위 |
| [docs/front_mockup_docs/router-design.md](docs/front_mockup_docs/router-design.md) | 프론트엔드 라우터 설계 |
| [docs/front_mockup_docs/frontend-mockup-prompt.md](docs/front_mockup_docs/frontend-mockup-prompt.md) | 프론트엔드 목업 구현 지시문 |
| [docs/db_docs/schema.sql](docs/db_docs/schema.sql) | Supabase 초기 스키마 |
| [docs/db_docs/seed_data.sql](docs/db_docs/seed_data.sql) | 시드 데이터 |
| [docs/db_docs/ERD.md](docs/db_docs/ERD.md) | ERD |
| [docs/db_docs/IA.md](docs/db_docs/IA.md) | 화면과 데이터 구조 |
| [docs/edge-function-guide-v3.md](docs/edge-function-guide-v3.md) | Meta와 Edge Function 연결 가이드 |
| [docs/session-prompts-2026-05-29.md](docs/session-prompts-2026-05-29.md) | 세션 프롬프트 보관 문서 |

## 다음 작업

1. Supabase Secrets에 Meta 관련 값을 등록합니다.
2. Meta 개발자 대시보드에서 Webhook Callback URL을 `instagram-webhook`으로 등록합니다.
3. 프론트엔드를 로컬 JSON 목업에서 Supabase 실데이터로 전환합니다.
4. `/test` 화면을 `test-match` Edge Function에 연결합니다.
5. RLS 정책과 `search_path` 보안 보완 작업을 진행합니다.

## 최근 검증

- `git diff --check` 통과.
- 민감정보 패턴 검색에서 실제 토큰값 없음.
- Codex 번들 Node로 `tsc -b` 통과.
- Codex 번들 Node로 `vite build` 통과.
