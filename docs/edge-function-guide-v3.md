# Instagram DM 자동응답 셋업 가이드 v3

Instagram DM 자동응답 시스템을 처음부터 끝까지 구축하는 단계별 가이드.  
각 단계는 **담당자**가 명확히 표시되어 있습니다.

| 표기 | 의미 |
|---|---|
| 🖐 **직접** | 브라우저 또는 Instagram 앱에서 사람이 직접 수행 |
| 🤖 **에이전트** | AI(Antigravity)에게 지시하여 자동으로 수행 |

---

## 섹션 1 — 메타 개발자 센터 셋팅하기

> 🖐 **직접**

### 1-1. Meta for Developers 접속 및 앱 생성

1. [https://developers.facebook.com/apps](https://developers.facebook.com/apps) 접속  
   (Facebook 계정으로 로그인 필요)
2. **Create App(앱 만들기)** 클릭
3. **Use case(이용 사례)** 선택 화면 → **"Other(기타)"** 선택 → **Next**
4. **App type(앱 유형)** 선택 → **"Business(비즈니스)"** 선택 → **Next**

   > ✅ 비즈니스 포트폴리오(Business Portfolio) 연결은 **하지 않아도 됩니다.** 해당 항목은 건너뜁니다.

5. 앱 이름 입력 (예: `insta-auto-dm`), 연락처 이메일 입력
6. **Create App(앱 만들기)** 완료

완료 후 확인:
- 앱 대시보드 URL: `https://developers.facebook.com/apps/{APP_ID}/dashboard`
- **App ID** 메모해두기 (이후 단계에서 사용)

---

## 섹션 2 — 인스타 계정 생성 및 프로페셔널로 전환

> 🖐 **직접**

### 2-1. Instagram 계정 생성

자동 응답에 사용할 Instagram 계정이 없는 경우 새로 생성합니다.

1. [https://www.instagram.com](https://www.instagram.com) 또는 Instagram 앱에서 **새 계정 만들기**
2. 사용자명, 비밀번호, 이메일/휴대폰 번호 입력 후 가입 완료

### 2-2. 비즈니스(프로페셔널) 계정으로 전환

> ⚠️ Meta Webhook을 통해 DM을 수신·발송하려면 반드시 **Business 또는 Creator** 계정이어야 합니다. 일반 개인 계정은 이용 불가.

**Instagram 앱 기준:**

1. 프로필 화면 오른쪽 상단 **≡ (메뉴)** → **설정 및 개인 정보**
2. **계정 유형 및 도구** → **프로페셔널 계정으로 전환**
3. 카테고리 선택 → **비즈니스** 선택 → 완료

**웹(instagram.com) 기준:**

1. 프로필 → **프로필 수정** → **계정 유형 전환** → **비즈니스 계정으로 전환**

---

## 섹션 3 — 메타 개발자로 이동 — 역할에서 인스타 계정 등록

> 🖐 **직접**

### 3-1. Instagram 테스터 계정 추가

1. [https://developers.facebook.com/apps/{APP_ID}/roles/roles](https://developers.facebook.com/apps) 에서 해당 앱 선택
2. 좌측 메뉴 **역할(Roles)** 클릭
3. **Instagram 테스터(Instagram Testers)** 탭 선택
4. **"Instagram 테스터 추가"** 버튼 클릭
5. 섹션 2에서 만든 Instagram 계정의 **사용자 이름(@아이디)** 입력 후 초대 전송

---

## 섹션 4 — 인스타그램에서 테스터 초대 수락

> 🖐 **직접**

### 4-1. 초대 수락

위 3-1에서 보낸 테스터 초대를 **Instagram 앱**에서 수락합니다.

**방법 A — Instagram 앱:**
1. Instagram 앱 → **프로필** → **≡ (메뉴)** → **설정 및 개인 정보**
2. **웹사이트 권한** (또는 **보안 → 앱 및 웹사이트**)
3. **테스트** 탭에서 초대 확인 → **수락** 클릭

**방법 B — 이메일 알림:**
- 가입 이메일로 발송된 초대 메일에서 **수락** 링크 클릭

> ✅ 수락 완료 후 다시 Meta 개발자 센터 역할 페이지에서 Instagram Testers 목록에 해당 계정이 표시되면 성공.

---

## 섹션 5 — 메타 개발자로 이동 — 권한 추가 및 액세스 토큰 생성

> 🖐 **직접**

### 5-1. Instagram 이용 사례 추가

1. 앱 대시보드에서 좌측 메뉴 **이용 사례(Use Cases)** 클릭
2. **이용 사례 추가** 버튼 클릭
3. **"Instagram에서 메시지 및 콘텐츠 관리 맞춤 설정"** 선택 후 추가

   > ℹ️ 앱 생성 시 이미 선택했다면 이 단계는 건너뜁니다. 대시보드 **앱 맞춤 설정 및 요건** 카드에 해당 항목이 표시되면 이미 추가된 것입니다.

### 5-2. 필수 메시지 권한 추가

1. **앱 맞춤 설정 및 요건** 카드에서 해당 이용 사례 클릭 → 이용 사례 맞춤 설정 페이지 진입
2. **"1. 필수 메시지 권한 추가"** 섹션에서 **"Add all required permissions"** 파란 버튼 클릭

   아래 세 권한이 한 번에 추가됩니다:
   - `instagram_business_basic` ✅
   - `instagram_manage_comments` ✅
   - `instagram_business_manage_messages` ✅

### 5-3. 액세스 토큰 생성

1. **"2. 액세스 토큰 생성"** 섹션을 찾아 펼침
2. 섹션 4에서 수락 완료한 Instagram 계정이 목록에 표시되는 것을 확인
3. 해당 계정 우측 **"토큰 생성"** 버튼 클릭
4. Instagram 로그인 팝업 → Business/Creator 계정으로 로그인 후 권한 승인

   > ⚠️ 일반 개인 계정은 안 됩니다. 반드시 섹션 2에서 프로페셔널로 전환한 계정으로 로그인.

5. 팝업이 닫히면 액세스 토큰이 표시됨 → **복사해서 안전한 곳에 저장**

### 5-4. Instagram Account ID 확인

아래 URL을 브라우저 주소창에 그대로 입력 (토큰값만 교체):

```
https://graph.instagram.com/v22.0/me?fields=id,username&access_token=발급받은_토큰값
```

정상 응답 예시:
```json
{
  "id": "25875875028749933",
  "username": "oz_insta_auto"
}
```

- `id` 값 → **`INSTAGRAM_ACCOUNT_ID`** (메모해두기)
- `access_token` 값 → **`INSTAGRAM_ACCESS_TOKEN`** (이미 메모함)

---

## 섹션 6 — Supabase Edge Function 생성 및 배포

> 🤖 **에이전트**

이 섹션은 AI 에이전트(Antigravity)가 **Supabase MCP**를 사용해 자동으로 처리합니다.

### 에이전트에게 아래 내용을 그대로 붙여넣으세요

```
@[docs/edge-function-guide-v3.md] 를 참고해서 아래 작업을 순서대로 수행해줘.

1. supabase MCP의 deploy_edge_function 툴을 사용해서 아래 2개의 edge function을 생성하고 배포해줘.
   - instagram-webhook (verify_jwt: false)
   - test-match (verify_jwt: false)

2. 각 함수의 소스코드는 이 문서의 섹션 6-A, 6-B에 있는 코드를 그대로 사용해줘.

배포 완료 후 두 함수의 URL을 알려줘.
```

### 6-A. `instagram-webhook` 소스코드

> ℹ️ v3 변경사항: 모든 주요 처리 단계에 `console.log` / `console.warn` / `console.error` 로그를 추가하여 Supabase 대시보드의 Edge Function 로그에서 실시간 디버깅이 가능합니다.

```typescript
// supabase/functions/instagram-webhook/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const META_VERIFY_TOKEN      = Deno.env.get('META_VERIFY_TOKEN')!
const INSTAGRAM_ACCESS_TOKEN = Deno.env.get('INSTAGRAM_ACCESS_TOKEN')!

type Rule = {
  id: string
  name: string
  match_type: 'contains' | 'exact'
  trigger_keywords: string[]
  reply_text: string
  reply_link: string | null
  priority: number
}

function matchRule(text: string, rules: Rule[]): { rule: Rule; keyword: string } | null {
  const lower = text.toLowerCase()
  for (const rule of rules) {
    for (const kw of rule.trigger_keywords) {
      const lowerKw = kw.toLowerCase()
      if (rule.match_type === 'exact' && lower === lowerKw) return { rule, keyword: kw }
      if (rule.match_type === 'contains' && lower.includes(lowerKw)) return { rule, keyword: kw }
    }
  }
  return null
}

async function sendDM(
  recipientId: string,
  text: string
): Promise<{ success: boolean; payload: unknown; error?: string }> {
  console.log(`[sendDM] sending to=${recipientId} text="${text.slice(0, 80)}${text.length > 80 ? '...' : ''}"`)
  try {
    const res = await fetch('https://graph.instagram.com/v22.0/me/messages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${INSTAGRAM_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recipient: { id: recipientId }, message: { text } }),
    })
    const payload = await res.json()
    if (!res.ok) {
      console.error(`[sendDM] FAILED status=${res.status}`, JSON.stringify(payload))
      return { success: false, payload, error: JSON.stringify(payload) }
    }
    console.log(`[sendDM] OK`, JSON.stringify(payload))
    return { success: true, payload }
  } catch (err) {
    console.error(`[sendDM] EXCEPTION`, String(err))
    return { success: false, payload: null, error: String(err) }
  }
}

async function sendAndLog(opts: {
  incomingLogId: string
  recipientId: string
  ruleId: string | null
  replyText: string
  replyLink: string | null
  testMode: boolean
}): Promise<void> {
  const { incomingLogId, recipientId, ruleId, replyText, replyLink, testMode } = opts
  if (testMode) {
    console.log(`[sendAndLog] test_mode=true → skip send (incomingLogId=${incomingLogId})`)
    return
  }
  const fullText = replyLink ? `${replyText}\n${replyLink}` : replyText
  const sendResult = await sendDM(recipientId, fullText)

  const { error: outErr } = await supabase.from('outgoing_messages').insert({
    incoming_log_id: incomingLogId,
    recipient_id: recipientId,
    matched_rule_id: ruleId,
    sent_text: replyText,
    sent_link: replyLink ?? null,
    send_status: sendResult.success ? 'success' : 'failed',
    error_message: sendResult.error ?? null,
    meta_response_payload: sendResult.payload,
    sent_at: new Date().toISOString(),
  })
  if (outErr) {
    console.error(`[sendAndLog] outgoing_messages insert FAILED`, outErr.message)
  } else {
    console.log(`[sendAndLog] outgoing_messages saved send_status=${sendResult.success ? 'success' : 'failed'}`)
  }
}

Deno.serve(async (req) => {
  const url = new URL(req.url)

  // GET: Meta Webhook 등록 검증
  if (req.method === 'GET') {
    const mode      = url.searchParams.get('hub.mode')
    const token     = url.searchParams.get('hub.verify_token')
    const challenge = url.searchParams.get('hub.challenge')
    console.log(`[GET] mode=${mode} token_match=${token === META_VERIFY_TOKEN}`)
    if (mode === 'subscribe' && token === META_VERIFY_TOKEN && challenge) {
      console.log(`[GET] webhook verification OK`)
      return new Response(challenge, { status: 200 })
    }
    console.warn(`[GET] webhook verification FAILED`)
    return new Response('Forbidden', { status: 403 })
  }

  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 })

  // POST: DM 수신 처리
  const ua = req.headers.get('user-agent') ?? ''
  if (!ua.includes('facebook') && !ua.includes('Instagram')) {
    console.warn(`[POST] blocked non-Meta request ua="${ua}"`)
    return new Response('Forbidden', { status: 403 })
  }

  let payload: any
  try {
    payload = await req.json()
  } catch {
    console.error(`[POST] JSON parse failed`)
    return new Response('Bad Request', { status: 400 })
  }

  console.log(`[POST] received object=${payload.object} entries=${payload.entry?.length ?? 0}`)

  if (payload.object !== 'instagram') {
    console.log(`[POST] non-instagram object → skip`)
    return new Response('OK', { status: 200 })
  }

  const processTask = async () => {
    const t0 = Date.now()
    console.log(`[process] start`)

    // settings + rules 병렬 조회
    const [{ data: settings, error: settingsErr }, { data: rules, error: rulesErr }] = await Promise.all([
      supabase.from('integration_settings').select('test_mode, fallback_reply, dedupe_window').single(),
      supabase.from('rules').select('id, name, match_type, trigger_keywords, reply_text, reply_link, priority').eq('is_active', true).order('priority', { ascending: false }),
    ])

    if (settingsErr) console.error(`[process] integration_settings fetch FAILED`, settingsErr.message)
    if (rulesErr)    console.error(`[process] rules fetch FAILED`, rulesErr.message)

    const testMode: boolean            = settings?.test_mode ?? false
    const fallbackReply: string | null = settings?.fallback_reply ?? null
    console.log(`[process] settings loaded test_mode=${testMode} fallback=${fallbackReply ? 'yes' : 'no'} rules=${rules?.length ?? 0}개`)

    for (const entry of payload.entry ?? []) {
      for (const event of entry.messaging ?? []) {
        const message = event.message

        if (message?.is_echo) {
          console.log(`[event] echo message → skip`)
          continue
        }
        if (!message?.text || !event.sender?.id) {
          console.log(`[event] no text or sender → skip (type=${JSON.stringify(Object.keys(message ?? {}))})`)
          continue
        }

        const senderId: string                 = event.sender.id
        const messageText: string              = message.text
        const platformMessageId: string | null = message.mid ?? null
        const receivedAt: string               = new Date(entry.time).toISOString()

        console.log(`[event] sender=${senderId} mid=${platformMessageId} text="${messageText.slice(0, 100)}${messageText.length > 100 ? '...' : ''}"`)

        // 중복 체크
        if (platformMessageId) {
          const { data: dup } = await supabase
            .from('incoming_messages')
            .select('id')
            .eq('platform_message_id', platformMessageId)
            .maybeSingle()
          if (dup) {
            console.log(`[event] duplicate mid=${platformMessageId} → skip`)
            continue
          }
        }

        // 규칙 매칭
        const matchResult = matchRule(messageText, (rules ?? []) as Rule[])
        if (matchResult) {
          console.log(`[match] HIT rule="${matchResult.rule.name}" keyword="${matchResult.keyword}" type=${matchResult.rule.match_type}`)
        } else {
          console.log(`[match] MISS → ${fallbackReply ? 'fallback reply' : 'no reply'}`)
        }

        // incoming_messages 저장
        const { data: incomingLog, error: incomingErr } = await supabase
          .from('incoming_messages')
          .insert({
            sender_id: senderId,
            message_text: messageText,
            platform_message_id: platformMessageId,
            matched_rule_id: matchResult?.rule.id ?? null,
            match_status: matchResult ? 'matched' : 'unmatched',
            raw_payload: entry,
            received_at: receivedAt,
          })
          .select()
          .single()

        if (incomingErr || !incomingLog) {
          console.error(`[incoming] insert FAILED`, incomingErr?.message)
          continue
        }
        console.log(`[incoming] saved id=${incomingLog.id}`)

        // 발송
        if (matchResult) {
          await sendAndLog({
            incomingLogId: incomingLog.id,
            recipientId: senderId,
            ruleId: matchResult.rule.id,
            replyText: matchResult.rule.reply_text,
            replyLink: matchResult.rule.reply_link,
            testMode,
          })
        } else if (fallbackReply) {
          await sendAndLog({
            incomingLogId: incomingLog.id,
            recipientId: senderId,
            ruleId: null,
            replyText: fallbackReply,
            replyLink: null,
            testMode,
          })
        }
      }
    }

    console.log(`[process] done elapsed=${Date.now() - t0}ms`)
  }

  // @ts-ignore
  EdgeRuntime.waitUntil(processTask())

  return new Response('OK', { status: 200 })
})
```

### 6-B. `test-match` 소스코드

```typescript
// supabase/functions/test-match/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

type Rule = {
  id: string
  name: string
  match_type: 'contains' | 'exact'
  trigger_keywords: string[]
  reply_text: string
  reply_link: string | null
  priority: number
}

function matchRule(
  text: string,
  rules: Rule[]
): { rule: Rule; keyword: string; matchType: string } | null {
  const lower = text.toLowerCase()
  for (const rule of rules) {
    for (const kw of rule.trigger_keywords) {
      const lowerKw = kw.toLowerCase()
      if (rule.match_type === 'exact' && lower === lowerKw) {
        return { rule, keyword: kw, matchType: 'exact' }
      }
      if (rule.match_type === 'contains' && lower.includes(lowerKw)) {
        return { rule, keyword: kw, matchType: 'contains' }
      }
    }
  }
  return null
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method Not Allowed' }, 405)
  }

  let body: { text?: string }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }

  if (!body.text || typeof body.text !== 'string' || body.text.trim() === '') {
    return json({ error: '`text` 필드가 필요합니다.' }, 400)
  }

  const inputText = body.text.trim()

  const { data: rules, error: rulesErr } = await supabase
    .from('rules')
    .select('id, name, match_type, trigger_keywords, reply_text, reply_link, priority')
    .eq('is_active', true)
    .order('priority', { ascending: false })

  if (rulesErr) {
    return json({ error: '규칙 조회 실패: ' + rulesErr.message }, 500)
  }

  const { data: settings } = await supabase
    .from('integration_settings')
    .select('fallback_reply')
    .single()

  const fallbackReply: string | null = settings?.fallback_reply ?? null

  const matchResult = matchRule(inputText, (rules ?? []) as Rule[])

  if (matchResult) {
    const { rule, keyword, matchType } = matchResult
    return json({
      matched: true,
      rule: {
        id: rule.id,
        name: rule.name,
        reply_text: rule.reply_text,
        reply_link: rule.reply_link,
        priority: rule.priority,
      },
      matched_keyword: keyword,
      match_type: matchType,
    })
  }

  return json({
    matched: false,
    fallback_reply: fallbackReply,
  })
})
```

### 6-C. 배포 완료 후 확인할 URL

에이전트 배포 완료 시 생성되는 Edge Function URL:

| 함수명 | URL |
|---|---|
| `instagram-webhook` | `https://sqvvtroenwdvuraxrtjw.supabase.co/functions/v1/instagram-webhook` |
| `test-match` | `https://sqvvtroenwdvuraxrtjw.supabase.co/functions/v1/test-match` |

---

## 섹션 7 — Supabase 대시보드에서 시크릿 등록

> 🖐 **직접**

### 7-1. Edge Function Secrets 등록

1. 아래 URL로 직접 접속:  
   [https://supabase.com/dashboard/project/sqvvtroenwdvuraxrtjw/settings/functions](https://supabase.com/dashboard/project/sqvvtroenwdvuraxrtjw/settings/functions)

2. **Edge Function Secrets** 섹션 → **"Add new secret"** 버튼을 반복 클릭하여 아래 **3개**를 등록:

| Name | Value |
|---|---|
| `META_VERIFY_TOKEN` | 본인이 직접 정한 임의 문자열 (예: `insta-dm-verify-2026-xyz`) |
| `INSTAGRAM_ACCESS_TOKEN` | 섹션 5-3에서 복사한 액세스 토큰 |
| `INSTAGRAM_ACCOUNT_ID` | 섹션 5-4에서 확인한 `id` 값 |

> ⚠️ 등록 후에는 값을 다시 확인할 수 없습니다. 반드시 비밀번호 관리 앱 등 안전한 곳에 미리 저장해두세요.

> ℹ️ `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`는 Supabase가 자동 주입하므로 별도 등록 불필요.

### 7-2. Webhook에 사용할 Edge Function URL 확인

섹션 8에서 Meta Webhook 설정 시 필요한 **콜백 URL**은 아래와 같습니다.  
(Supabase 대시보드 → Edge Functions 메뉴에서도 동일하게 확인 가능)

```
https://sqvvtroenwdvuraxrtjw.supabase.co/functions/v1/instagram-webhook
```

> ✅ `instagram-webhook` 함수의 URL만 사용합니다. `test-match`는 Meta와 무관합니다.

---

## 섹션 8 — 메타 개발자로 이동 — Webhook 설정 및 앱 게시

> 🖐 **직접**

### 8-1. Webhook 콜백 URL 등록

> ⚠️ Edge Function이 배포(섹션 6)된 이후에 진행해야 합니다.  
> Meta가 등록 시 GET 요청을 보내서 검증하기 때문에, 함수가 먼저 살아있어야 합니다.

1. [https://developers.facebook.com/apps](https://developers.facebook.com/apps) → 해당 앱 선택
2. 좌측 메뉴 **이용 사례** → **"Instagram에서 메시지 및 콘텐츠 관리 맞춤 설정"** 클릭
3. 이용 사례 맞춤 설정 페이지에서 **Webhooks** 섹션으로 스크롤
4. **"Callback URL(콜백 URL)"** 입력란에 아래 URL 입력:

   ```
   https://sqvvtroenwdvuraxrtjw.supabase.co/functions/v1/instagram-webhook
   ```

5. **"Verify Token(인증 토큰)"** 입력란에 → 섹션 7-1에서 `META_VERIFY_TOKEN`으로 등록한 **동일한 값** 입력

   > ⚠️ 이 값은 Supabase Secrets에 등록한 `META_VERIFY_TOKEN`과 **반드시 일치**해야 합니다.

6. **"Verify and Save(확인 및 저장)"** 클릭 → ✅ Edge Function이 응답하면 통과
7. **Webhook Fields**: `messages(메시지)` 항목 체크 → **Save(저장)**

### 8-2. 앱 라이브 게시

> ℹ️ Development(개발) 모드에서는 앱 관리자 계정만 테스트 가능합니다.  
> 실제 타인의 DM에 자동 응답하려면 Live 모드로 전환해야 합니다.

1. 앱 대시보드 상단 **"앱 모드"** 스위치 → **"라이브(Live)"** 로 전환
2. 팝업이 나타나면 **확인** 클릭

   > ⚠️ 라이브 모드 전환 시 App Review(앱 검수)가 필요할 수 있습니다.  
   > 검수가 필요한 경우 Meta 앱 검수 프로세스를 별도로 진행해야 합니다.

---

## 섹션 9 — 최종 테스트

> 🖐 **직접**

### 9-1. DM 자동 응답 테스트

1. **다른 Instagram 계정**으로 자동 응답을 설정한 Business 계정에 DM을 발송합니다.
2. Supabase 대시보드 → **Table Editor** → `incoming_messages` 테이블 확인:
   - 방금 보낸 메시지가 row로 저장되어 있으면 ✅
3. 규칙이 매칭됐다면 `outgoing_messages` 테이블에도 row 생성 확인 ✅
4. 테스트용 계정 Instagram 앱에서 **자동 답장이 도착했는지** 확인 ✅

### 9-2. 관리자 페이지 규칙 매칭 테스트

React 관리자 페이지 `/test` 에서 문장을 입력하고 `test-match` 함수가 정상 동작하는지 확인합니다.

### 9-3. Edge Function 로그 확인 (v3 신규)

Supabase 대시보드 → **Edge Functions** → `instagram-webhook` → **Logs** 탭에서 실시간 처리 로그를 확인할 수 있습니다.

| 로그 접두사 | 의미 |
|---|---|
| `[GET]` | Webhook 검증 요청 처리 결과 |
| `[POST]` | DM 수신 이벤트 수신 확인 |
| `[process]` | 설정/규칙 로딩 및 전체 처리 시간 |
| `[event]` | 개별 메시지 이벤트 파싱 결과 |
| `[match]` | 규칙 매칭 HIT/MISS 결과 |
| `[incoming]` | incoming_messages 저장 결과 |
| `[sendDM]` | Instagram API 발송 결과 |
| `[sendAndLog]` | outgoing_messages 저장 결과 |

---

## 부록 — 토큰 만료 주의사항

> ⚠️ 발급한 액세스 토큰은 **60일 후 만료**됩니다.

만료 전에 아래 URL로 갱신하세요 (토큰값만 교체):

```
GET https://graph.instagram.com/refresh_access_token
  ?grant_type=ig_refresh_token
  &access_token=현재_액세스_토큰값
```

갱신 후:
1. Supabase 대시보드 → Settings → Edge Functions → Secrets
2. `INSTAGRAM_ACCESS_TOKEN` 값을 갱신된 토큰으로 업데이트

> 💡 만료일 기준 **D-7** 정도에 갱신하는 것을 권장합니다.
