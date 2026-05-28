// Instagram DM 수신 로그 목록과 상세 패널을 렌더링합니다.
import { ExternalLink, Search } from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import incomingData from "../../public/data/routes/logs-incoming.json";
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

type IncomingLog = (typeof incomingData.view.logs)[number];
type MatchFilter = "all" | "matched" | "unmatched";

export default function IncomingLogsPage() {
  const navigate = useNavigate();
  const mock = useMockPageState(normalizeMockMode(incomingData.__mock.mode));
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<MatchFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredLogs = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return incomingData.view.logs.filter((log) => {
      const matchesKeyword =
        keyword.length === 0 ||
        log.sender.toLowerCase().includes(keyword) ||
        log.message.toLowerCase().includes(keyword);
      const matchesFilter =
        filter === "all" ||
        (filter === "matched" && log.matched) ||
        (filter === "unmatched" && !log.matched);

      return matchesKeyword && matchesFilter;
    });
  }, [filter, search]);

  function toggleExpanded(log: IncomingLog) {
    setExpandedId((current) => (current === log.id ? null : log.id));
  }

  return (
    <PageFrame
      title={incomingData.page.title}
      subtitle={incomingData.page.subtitle}
      state={mock.state}
      onReload={mock.reload}
      onShowSuccess={mock.showSuccess}
      onShowEmpty={mock.showEmpty}
      onShowError={mock.showError}
      actions={
        <Button
          variant="secondary"
          onClick={() => toast.success("CSV 내보내기 액션이 실행되었습니다.")}
        >
          {incomingData.actions.exportLabel}
        </Button>
      }
    >
      {mock.state === "initial" || mock.state === "loading" ? (
        <LoadingBlock rows={5} />
      ) : mock.state === "error" ? (
        <ErrorState
          description="수신 로그 더미 데이터를 표시하지 못한 상태입니다."
          onRetry={mock.reload}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>전체 수신 이력</CardTitle>
            <CardDescription>
              행을 클릭하면 플랫폼 메시지 ID와 원문 상세를 확인할 수 있습니다.
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
                  placeholder={incomingData.view.filters.keywordPlaceholder}
                />
              </div>
              <Select
                value={filter}
                onChange={(event) =>
                  setFilter(event.target.value as MatchFilter)
                }
              >
                {incomingData.view.filters.matchStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            {mock.state === "empty" || filteredLogs.length === 0 ? (
              <EmptyState
                title="조건에 맞는 수신 로그가 없습니다."
                description="테스트 페이지에서 문장을 넣어 매칭 흐름을 확인하세요."
                action={
                  <Button onClick={() => navigate("/test")}>
                    테스트 페이지로 이동
                  </Button>
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[920px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs text-muted-foreground">
                      <th className="py-3 font-medium">발신자</th>
                      <th className="py-3 font-medium">메시지 내용</th>
                      <th className="py-3 font-medium">수신 시각</th>
                      <th className="py-3 font-medium">매칭 여부</th>
                      <th className="py-3 font-medium">적용 규칙명</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log) => (
                      <Fragment key={log.id}>
                        <tr
                          onClick={() => toggleExpanded(log)}
                          className="cursor-pointer border-b transition-colors hover:bg-muted/70"
                        >
                          <td className="py-3 font-medium">{log.sender}</td>
                          <td className="max-w-[360px] truncate py-3 text-muted-foreground">
                            {log.message}
                          </td>
                          <td className="py-3">{log.receivedAt}</td>
                          <td className="py-3">
                            <Badge variant={log.matched ? "success" : "outline"}>
                              {log.matched ? "매칭됨" : "매칭 안 됨"}
                            </Badge>
                          </td>
                          <td className="py-3">{log.ruleName}</td>
                        </tr>
                        {expandedId === log.id ? (
                          <tr key={`${log.id}-detail`} className="border-b">
                            <td colSpan={5} className="bg-muted/40 p-4">
                              <div className="grid gap-3 rounded-md border bg-card p-4 md:grid-cols-[1fr_auto]">
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground">
                                    원문
                                  </p>
                                  <p className="mt-1 text-sm">{log.message}</p>
                                  <p className="mt-3 text-xs text-muted-foreground">
                                    플랫폼 메시지 ID: {log.platformMessageId}
                                  </p>
                                </div>
                                <Button
                                  variant="secondary"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    navigate("/logs/outgoing");
                                  }}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  발송 로그 보기
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ) : null}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </PageFrame>
  );
}
