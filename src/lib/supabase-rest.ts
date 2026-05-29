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
