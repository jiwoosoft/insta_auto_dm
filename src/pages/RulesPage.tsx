// 자동응답 규칙 목록과 필터를 렌더링합니다.
import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
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
import { normalizeMockMode, useMockPageState } from "../lib/mock-state";

type Rule = (typeof rulesData.view.rules)[number];
type StatusFilter = "all" | "active" | "inactive";

export default function RulesPage() {
  const navigate = useNavigate();
  const mock = useMockPageState(normalizeMockMode(rulesData.__mock.mode));
  const [rules, setRules] = useState<Rule[]>(rulesData.view.rules);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");

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

  function toggleRule(rule: Rule) {
    setRules((current) =>
      current.map((item) =>
        item.id === rule.id ? { ...item, isActive: !item.isActive } : item,
      ),
    );
    toast.success(
      `${rule.name} 규칙을 ${rule.isActive ? "비활성화" : "활성화"}했습니다.`,
    );
  }

  return (
    <PageFrame
      title={rulesData.page.title}
      subtitle={rulesData.page.subtitle}
      state={mock.state}
      onReload={mock.reload}
      onShowSuccess={mock.showSuccess}
      onShowEmpty={mock.showEmpty}
      onShowError={mock.showError}
      actions={
        <Button onClick={() => navigate("/rules/new")}>
          <Plus className="h-4 w-4" />
          {rulesData.actions.primaryButtonLabel}
        </Button>
      }
    >
      {mock.state === "initial" || mock.state === "loading" ? (
        <LoadingBlock rows={5} />
      ) : mock.state === "error" ? (
        <ErrorState
          description="규칙 목록 더미 데이터를 표시하지 못한 상태입니다."
          onRetry={mock.reload}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>등록된 규칙</CardTitle>
            <CardDescription>
              검색과 상태 필터는 로컬 상태로만 적용됩니다.
            </CardDescription>
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

            {mock.state === "empty" || filteredRules.length === 0 ? (
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
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleRule(rule);
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
