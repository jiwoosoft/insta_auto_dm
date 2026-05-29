// Instagram Webhook 수신과 규칙 기반 자동응답 발송을 처리합니다.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

const META_VERIFY_TOKEN = Deno.env.get('META_VERIFY_TOKEN')!
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
  const lower = text.trim().toLowerCase()
  for (const rule of rules) {
    for (const kw of rule.trigger_keywords) {
      const lowerKw = kw.trim().toLowerCase()
      if (rule.match_type === 'exact' && lower === lowerKw) return { rule, keyword: kw }
      if (rule.match_type === 'contains' && lower.includes(lowerKw)) return { rule, keyword: kw }
    }
  }
  return null
}

async function sendDM(
  recipientId: string,
  text: string,
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
  ruleId: string
  replyText: string
  replyLink: string | null
  testMode: boolean
}): Promise<void> {
  const { incomingLogId, recipientId, ruleId, replyText, replyLink, testMode } = opts
  if (testMode) {
    console.log(`[sendAndLog] test_mode=true -> skip send (incomingLogId=${incomingLogId})`)
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

  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode')
    const token = url.searchParams.get('hub.verify_token')
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
    console.log(`[POST] non-instagram object -> skip`)
    return new Response('OK', { status: 200 })
  }

  const processTask = async () => {
    const t0 = Date.now()
    console.log(`[process] start`)

    const [{ data: settings, error: settingsErr }, { data: rules, error: rulesErr }] = await Promise.all([
      supabase.from('integration_settings').select('test_mode, dedupe_window').single(),
      supabase
        .from('rules')
        .select('id, name, match_type, trigger_keywords, reply_text, reply_link, priority')
        .eq('is_active', true)
        .order('priority', { ascending: false }),
    ])

    if (settingsErr) console.error(`[process] integration_settings fetch FAILED`, settingsErr.message)
    if (rulesErr) console.error(`[process] rules fetch FAILED`, rulesErr.message)

    const testMode: boolean = settings?.test_mode ?? false
    console.log(`[process] settings loaded test_mode=${testMode} rules=${rules?.length ?? 0}개`)

    for (const entry of payload.entry ?? []) {
      for (const event of entry.messaging ?? []) {
        const message = event.message

        if (message?.is_echo) {
          console.log(`[event] echo message -> skip`)
          continue
        }
        if (!message?.text || !event.sender?.id) {
          console.log(`[event] no text or sender -> skip (type=${JSON.stringify(Object.keys(message ?? {}))})`)
          continue
        }

        const senderId: string = event.sender.id
        const messageText: string = message.text
        const platformMessageId: string | null = message.mid ?? null
        const receivedAt: string = entry.time
          ? new Date(entry.time).toISOString()
          : new Date().toISOString()

        console.log(`[event] sender=${senderId} mid=${platformMessageId} text="${messageText.slice(0, 100)}${messageText.length > 100 ? '...' : ''}"`)

        if (platformMessageId) {
          const { data: dup } = await supabase
            .from('incoming_messages')
            .select('id')
            .eq('platform_message_id', platformMessageId)
            .maybeSingle()
          if (dup) {
            console.log(`[event] duplicate mid=${platformMessageId} -> skip`)
            continue
          }
        }

        const matchResult = matchRule(messageText, (rules ?? []) as Rule[])
        if (matchResult) {
          console.log(`[match] HIT rule="${matchResult.rule.name}" keyword="${matchResult.keyword}" type=${matchResult.rule.match_type}`)
        } else {
          console.log(`[match] MISS -> save incoming only, no auto reply`)
        }

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

        if (!matchResult) {
          continue
        }

        await sendAndLog({
          incomingLogId: incomingLog.id,
          recipientId: senderId,
          ruleId: matchResult.rule.id,
          replyText: matchResult.rule.reply_text,
          replyLink: matchResult.rule.reply_link,
          testMode,
        })
      }
    }

    console.log(`[process] done elapsed=${Date.now() - t0}ms`)
  }

  // @ts-ignore
  EdgeRuntime.waitUntil(processTask())

  return new Response('OK', { status: 200 })
})
