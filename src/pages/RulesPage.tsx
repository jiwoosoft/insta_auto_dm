// 자동응답 규칙 목록을 Supabase 실데이터 또는 로컬 목업으로 렌더링합니다.
import { Plus, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import rulesData from "../../public/data/routes/rules.json";
import {
  EmptyState,
  ErrorState,
  LoadingBlock,
  PageFrame,
} from "../components/layout/PageFrame";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import {
  getSupabaseStatusLabel,
  isSupabaseConfigured,
  listRules,
  MatchType,
  RuleView,
  updateRule as updateRemoteRule,
} from "../lib/supabase-rest";
import {
  normalizeMockMode,
  PageState,
  useMockPageState,
} from "../lib/mock-state";

type LocalRule = (typeof rulesData.view.rules)[number];
type StatusFilter = "all" | "active" | "inactive";

const usesSupabase = isSupabaseConfigured();

function toFallbackRule(rule: LocalRule): RuleView {
  return {
    id: rule.id,
    name: rule.name,
    description: "",
    matchType: rule.matchType as MatchType,
    keywords: rule.keywords,
    triggerKeywords: rule.keywords,
    replyText: rule.replyText,
    replyLink: "",
    priority: rule.priority,
    isActive: rule.isActive,
    updatedAt: rule.updatedAt,
  };
}

export default function RulesPage() {
  const navigate = useNavigate();
  const mock = useMockPageState(normalizeMockMode(rulesData.__mock.mode));
  const [pageState, setPageState] = useState<PageState>(
    usesSupabase ? "loading" : "initial",
  );
  const [rules, setRules] = useState<RuleView[]>(
    rulesData.view.rules.map(toFallbackRule),
  );
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [pendingRuleId, setPendingRuleId] = useState<string | null>(null);
  const state = usesSupabase ? pageState : mock.state;

  const loadRules = useCallback(async () => {
    if (!usesSupabase) {
      return;
    }

    setPageState("loading");
    try {
      const remoteRules = await listRules();
      setRules(remoteRules);
      setPageState(remoteRules.length > 0 ? "success" : "empty");
    } catch (error) {
      setPageState("error");
      toast.error(error instanceof Error ? error.message : "규칙 조회에 실패했습니다.");
    }
  }, []);

  useEffect(() => {
    void loadRules();
  }, [loadRules]);

  const filteredRules = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return rules.filter((rule) => {
      const matchesKeyword =
        keyword.length === 0 ||
        rule.name.toLowerCase().includes(keyword) ||
        rule.keywords.some((item) => item.toLowerCase().includes(keyword));
      const matchesStatus =
        status === "all" ||
        (status === "active" && rule.isActive) ||
        (status === "inactive" && !rule.isActive);

      return matchesKeyword && matchesStatus;
    });
  }, [rules, search, status]);

  async function toggleRule(rule: RuleView) {
    if (!usesSupabase) {
      setRules((current) =>
        current.map((item) =>
          item.id === rule.id ? { ...item, isActive: !item.isActive } : item,
        ),
      );
      toast.success(
        `${rule.name} 규칙을 ${rule.isActive ? "비활성화" : "활성화"}했습니다.`,
      );
      return;
    }

    setPendingRuleId(rule.id);
    try {
      const updated = await updateRemoteRule(rule.id, {
        isActive: !rule.isActive,
      });
      setRules((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      toast.success(
        `${updated.name} 규칙을 ${updated.isActive ? "활성화" : "비활성화"}했습니다.`,
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "규칙 상태 변경에 실패했습니다.");
    } finally {
      setPendingRuleId(null);
    }
  }

  return (
    <PageFrame
      title={rulesData.page.title}
      subtitle={rulesData.page.subtitle}
      state={state}
      onReload={usesSupabase ? loadRules : mock.reload}
      onShowSuccess={() => (usesSupabase ? setPageState("success") : mock.showSuccess())}
      onShowEmpty={() => (usesSupabase ? setPageState("empty") : mock.showEmpty())}
      onShowError={() => (usesSupabase ? setPageState("error") : mock.showError())}
      actions={
        <Button onClick={() => navigate("/rules/new")}>
          <Plus className="h-4 w-4" />
          {rulesData.actions.primaryButtonLabel}
        </Button>
      }
    >
      {state === "initial" || state === "loading" ? (
        <LoadingBlock rows={5} />
      ) : state === "error" ? (
        <ErrorState
          description={
            usesSupabase
              ? "Supabase 규칙 데이터를 불러오지 못했습니다. 환경변수와 RLS 정책을 확인하세요."
              : "규칙 목록 더미 데이터를 표시하지 못한 상태입니다."
          }
          onRetry={usesSupabase ? loadRules : mock.reload}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>등록된 규칙</CardTitle>
            <CardDescription>{getSupabaseStatusLabel()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="relative max-w-xl flex-1">
                <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={rulesData.view.filters.searchPlaceholder}
                />
              </div>
              <Select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as StatusFilter)
                }
              >
                {rulesData.view.filters.statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            {state === "empty" || filteredRules.length === 0 ? (
              <EmptyState
                title="조건에 맞는 규칙이 없습니다."
                description="검색어를 지우거나 새 규칙을 만들어 운영 기준을 추가하세요."
                action={
                  <Button onClick={() => navigate("/rules/new")}>
                    <Plus className="h-4 w-4" />새 규칙 만들기
                  </Button>
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[920px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs text-muted-foreground">
                      <th className="py-3 font-medium">규칙명</th>
                      <th className="py-3 font-medium">매칭 방식</th>
                      <th className="py-3 font-medium">키워드 수</th>
                      <th className="py-3 font-medium">응답 미리보기</th>
                      <th className="py-3 font-medium">상태</th>
                      <th className="py-3 font-medium">우선순위</th>
                      <th className="py-3 font-medium">최종 수정일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRules.map((rule) => (
                      <tr
                        key={rule.id}
                        onClick={() => navigate(`/rules/${rule.id}`)}
                        className="cursor-pointer border-b transition-colors last:border-0 hover:bg-muted/70"
                      >
                        <td className="py-3">
                          <div className="font-medium">{rule.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {rule.keywords.join(", ")}
                          </div>
                        </td>
                        <td className="py-3">
                          <Badge variant="secondary">{rule.matchType}</Badge>
                        </td>
                        <td className="py-3">{rule.keywords.length}</td>
                        <td className="max-w-[280px] truncate py-3 text-muted-foreground">
                          {rule.replyText}
                        </td>
                        <td className="py-3">
                          <Button
                            variant={rule.isActive ? "secondary" : "outline"}
                            size="sm"
                            disabled={pendingRuleId === rule.id}
                            onClick={(event) => {
                              event.stopPropagation();
                              void toggleRule(rule);
                            }}
                          >
                            {rule.isActive ? "ON" : "OFF"}
                          </Button>
                        </td>
                        <td className="py-3 font-medium">{rule.priority}</td>
                        <td className="py-3 text-muted-foreground">
                          {rule.updatedAt}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-4 flex items-center justify-end gap-2 text-sm text-muted-foreground">
                  <Button variant="outline" size="sm" disabled>
                    이전
                  </Button>
                  <Badge variant="outline">1</Badge>
                  <Button variant="outline" size="sm" disabled>
                    다음
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </PageFrame>
  );
}
