// Supabase REST API와 Edge Function 호출을 담당합니다.
export type MatchType = "contains" | "exact";

export type RuleFormInput = {
  name: string;
  description: string;
  matchType: MatchType;
  keywords: string[];
  replyText: string;
  replyLink: string;
  priority: number;
  isActive: boolean;
};

export type RuleView = RuleFormInput & {
  id: string;
  updatedAt: string;
  triggerKeywords: string[];
};

export type IncomingLogView = {
  id: string;
  sender: string;
  message: string;
  receivedAt: string;
  matched: boolean;
  ruleName: string;
  platformMessageId: string;
};

export type OutgoingLogView = {
  id: string;
  recipient: string;
  ruleId: string | null;
  ruleName: string;
  status: "success" | "failed";
  sentAt: string;
  replyText: string;
  replyLink: string;
  failureReason: string;
  metaResponse: string;
};

type RuleRow = {
  id: string;
  name: string;
  description: string | null;
  match_type: MatchType;
  trigger_keywords: string[];
  reply_text: string;
  reply_link: string | null;
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
};

type IncomingLogRow = {
  id: string;
  sender_id: string;
  sender_alias: string | null;
  message_text: string;
  platform_message_id: string | null;
  matched_rule_id: string | null;
  match_status: "matched" | "unmatched" | string;
  received_at: string;
  rules: { name: string } | null;
};

type OutgoingLogRow = {
  id: string;
  recipient_id: string;
  recipient_alias: string | null;
  matched_rule_id: string | null;
  sent_text: string;
  sent_link: string | null;
  send_status: "success" | "failed" | string;
  error_message: string | null;
  meta_response_payload: unknown;
  sent_at: string;
  rules: { name: string } | null;
};

export type RemoteMatchResult =
  | {
      matched: true;
      rule: {
        id: string;
        name: string;
        reply_text: string;
        reply_link: string | null;
        priority: number;
      };
      matched_keyword: string;
      match_type: MatchType;
    }
  | {
      matched: false;
      fallback_reply?: string | null;
    };

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "") ?? "";
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  "";

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseKey);
}

export function getSupabaseStatusLabel() {
  return isSupabaseConfigured()
    ? "Supabase 실데이터 연결됨"
    : "환경변수 없음. 로컬 목업 사용 중";
}

async function supabaseRequest<T>(
  path: string,
  init: RequestInit & { prefer?: string } = {},
): Promise<T> {
  if (!isSupabaseConfigured()) {
    throw new Error("VITE_SUPABASE_URL과 VITE_SUPABASE_PUBLISHABLE_KEY가 필요합니다.");
  }

  const headers = new Headers(init.headers);
  headers.set("apikey", supabaseKey);
  headers.set("Authorization", `Bearer ${supabaseKey}`);
  headers.set("Content-Type", "application/json");
  if (init.prefer) {
    headers.set("Prefer", init.prefer);
  }

  const response = await fetch(`${supabaseUrl}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function readErrorMessage(response: Response) {
  try {
    const body = await response.json();
    return body.message ?? body.error ?? `Supabase 요청 실패. HTTP ${response.status}`;
  } catch {
    return `Supabase 요청 실패. HTTP ${response.status}`;
  }
}

function toRuleView(row: RuleRow): RuleView {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    matchType: row.match_type,
    keywords: row.trigger_keywords ?? [],
    triggerKeywords: row.trigger_keywords ?? [],
    replyText: row.reply_text,
    replyLink: row.reply_link ?? "",
    priority: row.priority,
    isActive: row.is_active,
    updatedAt: formatDateTime(row.updated_at),
  };
}

function toRulePayload(input: RuleFormInput) {
  return {
    name: input.name.trim(),
    description: input.description.trim() || null,
    match_type: input.matchType,
    trigger_keywords: input.keywords.map((item) => item.trim()).filter(Boolean),
    reply_text: input.replyText.trim(),
    reply_link: input.replyLink.trim() || null,
    priority: input.priority,
    is_active: input.isActive,
  };
}

function formatDateTime(value: string) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatActor(alias: string | null, id: string) {
  return alias?.trim() || id;
}

function formatRuleName(ruleId: string | null, rule?: { name: string } | null) {
  if (rule?.name) {
    return rule.name;
  }

  return ruleId ? "삭제된 규칙" : "-";
}

function formatMetaResponse(value: unknown) {
  if (!value) {
    return "-";
  }

  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value);
}

function toIncomingLogView(row: IncomingLogRow): IncomingLogView {
  return {
    id: row.id,
    sender: formatActor(row.sender_alias, row.sender_id),
    message: row.message_text,
    receivedAt: formatDateTime(row.received_at),
    matched: row.match_status === "matched",
    ruleName: formatRuleName(row.matched_rule_id, row.rules),
    platformMessageId: row.platform_message_id ?? "-",
  };
}

function toOutgoingLogView(row: OutgoingLogRow): OutgoingLogView {
  return {
    id: row.id,
    recipient: formatActor(row.recipient_alias, row.recipient_id),
    ruleId: row.matched_rule_id,
    ruleName: formatRuleName(row.matched_rule_id, row.rules),
    status: row.send_status === "success" ? "success" : "failed",
    sentAt: formatDateTime(row.sent_at),
    replyText: row.sent_text,
    replyLink: row.sent_link ?? "",
    failureReason: row.error_message ?? "",
    metaResponse: formatMetaResponse(row.meta_response_payload),
  };
}

export async function listRules() {
  const rows = await supabaseRequest<RuleRow[]>(
    "/rest/v1/rules?select=*&order=priority.desc,updated_at.desc",
  );

  return rows.map(toRuleView);
}

export async function getRule(id: string) {
  const rows = await supabaseRequest<RuleRow[]>(
    `/rest/v1/rules?id=eq.${encodeURIComponent(id)}&select=*&limit=1`,
  );

  return rows[0] ? toRuleView(rows[0]) : null;
}

export async function createRule(input: RuleFormInput) {
  const rows = await supabaseRequest<RuleRow[]>("/rest/v1/rules?select=*", {
    method: "POST",
    body: JSON.stringify(toRulePayload(input)),
    prefer: "return=representation",
  });

  return toRuleView(rows[0]);
}

export async function updateRule(id: string, input: Partial<RuleFormInput>) {
  const payload: Record<string, unknown> = {};
  if (input.name !== undefined) payload.name = input.name.trim();
  if (input.description !== undefined) {
    payload.description = input.description.trim() || null;
  }
  if (input.matchType !== undefined) payload.match_type = input.matchType;
  if (input.keywords !== undefined) {
    payload.trigger_keywords = input.keywords
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (input.replyText !== undefined) payload.reply_text = input.replyText.trim();
  if (input.replyLink !== undefined) {
    payload.reply_link = input.replyLink.trim() || null;
  }
  if (input.priority !== undefined) payload.priority = input.priority;
  if (input.isActive !== undefined) payload.is_active = input.isActive;

  const rows = await supabaseRequest<RuleRow[]>(
    `/rest/v1/rules?id=eq.${encodeURIComponent(id)}&select=*`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
      prefer: "return=representation",
    },
  );

  return toRuleView(rows[0]);
}

export async function deleteRule(id: string) {
  await supabaseRequest<void>(`/rest/v1/rules?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function listIncomingLogs() {
  const rows = await supabaseRequest<IncomingLogRow[]>(
    [
      "/rest/v1/incoming_messages",
      "?select=id,sender_id,sender_alias,message_text,platform_message_id,matched_rule_id,match_status,received_at,rules(name)",
      "&order=received_at.desc",
      "&limit=200",
    ].join(""),
  );

  return rows.map(toIncomingLogView);
}

export async function listOutgoingLogs() {
  const rows = await supabaseRequest<OutgoingLogRow[]>(
    [
      "/rest/v1/outgoing_messages",
      "?select=id,recipient_id,recipient_alias,matched_rule_id,sent_text,sent_link,send_status,error_message,meta_response_payload,sent_at,rules(name)",
      "&order=sent_at.desc",
      "&limit=200",
    ].join(""),
  );

  return rows.map(toOutgoingLogView);
}

export async function runRemoteMatch(text: string) {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase 환경변수가 필요합니다.");
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/test-match`, {
    method: "POST",
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new Error(message);
  }

  return (await response.json()) as RemoteMatchResult;
}
