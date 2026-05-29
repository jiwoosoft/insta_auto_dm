// 자동응답 발송 로그 목록과 실패 상세를 렌더링합니다.
import { ExternalLink, Search } from "lucide-react";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import outgoingData from "../../public/data/routes/logs-outgoing.json";
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
  normalizeMockMode,
  PageState,
  useMockPageState,
} from "../lib/mock-state";
import {
  getSupabaseStatusLabel,
  isSupabaseConfigured,
  listOutgoingLogs,
  OutgoingLogView,
} from "../lib/supabase-rest";

type MockOutgoingLog = (typeof outgoingData.view.logs)[number];
type StatusFilter = "all" | "success" | "failed";

const usesSupabase = isSupabaseConfigured();

function toFallbackOutgoingLog(log: MockOutgoingLog): OutgoingLogView {
  return {
    id: log.id,
    recipient: log.recipient,
    ruleId: log.ruleId,
    ruleName: log.ruleName,
    status: log.status as "success" | "failed",
    sentAt: log.sentAt,
    replyText: log.replyText,
    replyLink: log.replyLink,
    failureReason: log.failureReason,
    metaResponse: log.metaResponse,
  };
}

export default function OutgoingLogsPage() {
  const navigate = useNavigate();
  const mock = useMockPageState(normalizeMockMode(outgoingData.__mock.mode));
  const [pageState, setPageState] = useState<PageState>(
    usesSupabase ? "loading" : "initial",
  );
  const [logs, setLogs] = useState<OutgoingLogView[]>(
    outgoingData.view.logs.map(toFallbackOutgoingLog),
  );
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const state = usesSupabase ? pageState : mock.state;

  const loadLogs = useCallback(async () => {
    if (!usesSupabase) {
      return;
    }

    setPageState("loading");
    try {
      const remoteLogs = await listOutgoingLogs();
      setLogs(remoteLogs);
      setPageState(remoteLogs.length > 0 ? "success" : "empty");
    } catch (error) {
      setPageState("error");
      toast.error(error instanceof Error ? error.message : "발송 로그 조회에 실패했습니다.");
    }
  }, []);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  const filteredLogs = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return logs.filter((log) => {
      const matchesKeyword =
        keyword.length === 0 ||
        log.recipient.toLowerCase().includes(keyword) ||
        log.ruleName.toLowerCase().includes(keyword) ||
        log.replyText.toLowerCase().includes(keyword);
      const matchesFilter = filter === "all" || log.status === filter;

      return matchesKeyword && matchesFilter;
    });
  }, [filter, logs, search]);

  function toggleExpanded(log: OutgoingLogView) {
    setExpandedId((current) => (current === log.id ? null : log.id));
  }

  return (
    <PageFrame
      title={outgoingData.page.title}
      subtitle={outgoingData.page.subtitle}
      state={state}
      onReload={usesSupabase ? loadLogs : mock.reload}
      onShowSuccess={() => (usesSupabase ? setPageState("success") : mock.showSuccess())}
      onShowEmpty={() => (usesSupabase ? setPageState("empty") : mock.showEmpty())}
      onShowError={() => (usesSupabase ? setPageState("error") : mock.showError())}
      actions={
        <Button
          variant="secondary"
          onClick={() => toast.success("CSV 내보내기 액션이 실행되었습니다.")}
        >
          {outgoingData.actions.exportLabel}
        </Button>
      }
    >
      {state === "initial" || state === "loading" ? (
        <LoadingBlock rows={5} />
      ) : state === "error" ? (
        <ErrorState
          description={
            usesSupabase
              ? "Supabase 발송 로그를 불러오지 못했습니다. 환경변수와 테이블 권한을 확인하세요."
              : "발송 로그 더미 데이터를 표시하지 못한 상태입니다."
          }
          onRetry={usesSupabase ? loadLogs : mock.reload}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>자동응답 발송 이력</CardTitle>
            <CardDescription>
              {getSupabaseStatusLabel()} · 실패 행을 펼치면 실패 사유와 Meta 응답을 확인할 수 있습니다.
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
                  placeholder={outgoingData.view.filters.keywordPlaceholder}
                />
              </div>
              <Select
                value={filter}
                onChange={(event) =>
                  setFilter(event.target.value as StatusFilter)
                }
              >
                {outgoingData.view.filters.statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            {state === "empty" || filteredLogs.length === 0 ? (
              <EmptyState
                title="조건에 맞는 발송 로그가 없습니다."
                description="수신 로그에서 매칭 여부를 먼저 확인하세요."
                action={
                  <Button onClick={() => navigate("/logs/incoming")}>
                    수신 로그로 이동
                  </Button>
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[920px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs text-muted-foreground">
                      <th className="py-3 font-medium">수신자</th>
                      <th className="py-3 font-medium">적용 규칙</th>
                      <th className="py-3 font-medium">발송 상태</th>
                      <th className="py-3 font-medium">발송 시각</th>
                      <th className="py-3 font-medium">액션</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log) => (
                      <Fragment key={log.id}>
                        <tr
                          onClick={() => toggleExpanded(log)}
                          className="cursor-pointer border-b transition-colors hover:bg-muted/70"
                        >
                          <td className="py-3 font-medium">{log.recipient}</td>
                          <td className="py-3">{log.ruleName}</td>
                          <td className="py-3">
                            <Badge
                              variant={
                                log.status === "success"
                                  ? "success"
                                  : "destructive"
                              }
                            >
                              {log.status === "success" ? "성공" : "실패"}
                            </Badge>
                          </td>
                          <td className="py-3 text-muted-foreground">
                            {log.sentAt}
                          </td>
                          <td className="py-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={!log.ruleId}
                              onClick={(event) => {
                                event.stopPropagation();
                                if (log.ruleId) {
                                  navigate(`/rules/${log.ruleId}`);
                                }
                              }}
                            >
                              규칙 보기
                            </Button>
                          </td>
                        </tr>
                        {expandedId === log.id ? (
                          <tr key={`${log.id}-detail`} className="border-b">
                            <td colSpan={5} className="bg-muted/40 p-4">
                              <div className="grid gap-3 rounded-md border bg-card p-4 xl:grid-cols-[1fr_auto]">
                                <div className="space-y-2">
                                  <p className="text-xs font-medium text-muted-foreground">
                                    발송 텍스트
                                  </p>
                                  <p className="text-sm">{log.replyText}</p>
                                  {log.replyLink ? (
                                    <p className="text-sm text-muted-foreground">
                                      링크: {log.replyLink}
                                    </p>
                                  ) : null}
                                  <p className="text-sm">
                                    실패 사유:{" "}
                                    {log.failureReason || "해당 없음"}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Meta 응답: {log.metaResponse}
                                  </p>
                                </div>
                                <div className="flex flex-wrap items-start gap-2">
                                  <Button
                                    variant="secondary"
                                    disabled={!log.ruleId}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      if (log.ruleId) {
                                        navigate(`/rules/${log.ruleId}`);
                                      }
                                    }}
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                    관련 규칙
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      navigate("/logs/incoming");
                                    }}
                                  >
                                    수신 로그
                                  </Button>
                                </div>
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
