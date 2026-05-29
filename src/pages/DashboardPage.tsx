// 운영 현황 대시보드 화면을 렌더링합니다.
import {
  ArrowRight,
  FlaskConical,
  Inbox,
  ListChecks,
  MessageSquarePlus,
  TriangleAlert,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import dashboardData from "../../public/data/routes/dashboard.json";
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
import {
  normalizeMockMode,
  PageState,
  useMockPageState,
} from "../lib/mock-state";
import {
  getSupabaseStatusLabel,
  IncomingLogView,
  isSupabaseConfigured,
  listIncomingLogs,
  listOutgoingLogs,
  listRules,
  OutgoingLogView,
  RuleView,
} from "../lib/supabase-rest";

const quickLinkIcons = [MessageSquarePlus, ListChecks, Inbox, FlaskConical];
const usesSupabase = isSupabaseConfigured();

type DashboardKpi = (typeof dashboardData.view.kpis)[number];
type DashboardIncoming = (typeof dashboardData.view.recentIncoming)[number];
type DashboardFailure = (typeof dashboardData.view.recentOutgoingFailures)[number];
type DashboardView = {
  kpis: DashboardKpi[];
  recentIncoming: DashboardIncoming[];
  recentOutgoingFailures: DashboardFailure[];
};

function isSameLocalDate(value?: string) {
  if (!value) {
    return false;
  }

  const current = new Date();
  const target = new Date(value);

  return (
    current.getFullYear() === target.getFullYear() &&
    current.getMonth() === target.getMonth() &&
    current.getDate() === target.getDate()
  );
}

function toPercent(value: number, total: number) {
  if (total === 0) {
    return "0%";
  }

  return `${Math.round((value / total) * 100)}%`;
}

function buildDashboardView(
  rules: RuleView[],
  incomingLogs: IncomingLogView[],
  outgoingLogs: OutgoingLogView[],
): DashboardView {
  const activeRules = rules.filter((rule) => rule.isActive).length;
  const todayIncoming = incomingLogs.filter((log) =>
    isSameLocalDate(log.receivedAtRaw),
  );
  const todayOutgoing = outgoingLogs.filter((log) =>
    isSameLocalDate(log.sentAtRaw),
  );
  const todaySuccess = todayOutgoing.filter(
    (log) => log.status === "success",
  ).length;
  const successRate =
    todayOutgoing.length > 0
      ? `${toPercent(todaySuccess, todayOutgoing.length)} 성공률`
      : "오늘 발송 없음";

  return {
    kpis: [
      {
        label: "총 규칙 수",
        value: String(rules.length),
        delta: "Supabase 실시간",
        tone: "neutral",
      },
      {
        label: "활성 규칙 수",
        value: String(activeRules),
        delta: `${toPercent(activeRules, rules.length)} 활성`,
        tone: "success",
      },
      {
        label: "오늘 수신 메시지",
        value: String(todayIncoming.length),
        delta: "오늘 기준",
        tone: "info",
      },
      {
        label: "오늘 발송 성공",
        value: String(todaySuccess),
        delta: successRate,
        tone: todaySuccess > 0 ? "success" : "neutral",
      },
    ],
    recentIncoming: incomingLogs.slice(0, 4).map((log) => ({
      id: log.id,
      sender: log.sender,
      message: log.message,
      receivedAt: log.receivedAt,
      matched: log.matched,
      ruleName: log.ruleName,
    })),
    recentOutgoingFailures: outgoingLogs
      .filter((log) => log.status === "failed")
      .slice(0, 3)
      .map((log) => ({
        id: log.id,
        recipient: log.recipient,
        ruleName: log.ruleName,
        reason: log.failureReason || "오류 사유 없음",
        sentAt: log.sentAt,
      })),
  };
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const mock = useMockPageState(normalizeMockMode(dashboardData.__mock.mode));
  const [pageState, setPageState] = useState<PageState>(
    usesSupabase ? "loading" : "initial",
  );
  const [view, setView] = useState<DashboardView>(dashboardData.view);
  const state = usesSupabase ? pageState : mock.state;
  const hasRecentData =
    view.recentIncoming.length > 0 || view.recentOutgoingFailures.length > 0;

  const loadDashboard = useCallback(async (notify = false) => {
    if (!usesSupabase) {
      return;
    }

    setPageState("loading");
    try {
      const [rules, incomingLogs, outgoingLogs] = await Promise.all([
        listRules(),
        listIncomingLogs(),
        listOutgoingLogs(),
      ]);
      const nextView = buildDashboardView(rules, incomingLogs, outgoingLogs);

      setView(nextView);
      setPageState(hasDashboardRows(nextView) ? "success" : "empty");
      if (notify) {
        toast.success("대시보드 정보를 갱신했습니다.");
      }
    } catch (error) {
      setPageState("error");
      toast.error(
        error instanceof Error
          ? error.message
          : "대시보드 정보 조회에 실패했습니다.",
      );
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  return (
    <PageFrame
      title={dashboardData.page.title}
      subtitle={dashboardData.page.subtitle}
      state={state}
      onReload={() => {
        if (usesSupabase) {
          void loadDashboard(true);
          return;
        }

        mock.reload();
      }}
      onShowSuccess={() =>
        usesSupabase ? setPageState("success") : mock.showSuccess()
      }
      onShowEmpty={() =>
        usesSupabase ? setPageState("empty") : mock.showEmpty()
      }
      onShowError={() =>
        usesSupabase ? setPageState("error") : mock.showError()
      }
    >
      {state === "initial" || state === "loading" ? (
        <LoadingBlock rows={4} />
      ) : state === "error" ? (
        <ErrorState
          description={
            usesSupabase
              ? "Supabase 대시보드 정보를 불러오지 못했습니다. 환경변수와 테이블 권한을 확인하세요."
              : "대시보드 더미 데이터를 표시하지 못한 상태입니다."
          }
          onRetry={() => {
            if (usesSupabase) {
              void loadDashboard(true);
              return;
            }

            mock.reload();
          }}
        />
      ) : state === "empty" || !hasRecentData ? (
        <EmptyState
          title="표시할 최근 로그가 없습니다."
          description="새 규칙을 만든 뒤 테스트 화면에서 운영 흐름을 확인하세요."
          action={
            <Button onClick={() => navigate("/rules/new")}>
              <MessageSquarePlus className="h-4 w-4" />새 규칙 만들기
            </Button>
          }
        />
      ) : (
        <div className="space-y-5">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {view.kpis.map((kpi) => (
              <Card
                key={kpi.label}
                className="transition-transform hover:-translate-y-0.5"
              >
                <CardHeader className="pb-2">
                  <CardDescription>{kpi.label}</CardDescription>
                  <CardTitle className="text-3xl">{kpi.value}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge
                    variant={kpi.tone === "success" ? "success" : "secondary"}
                  >
                    {kpi.delta}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </section>

          <Card>
            <CardHeader>
              <CardTitle>빠른 실행</CardTitle>
              <CardDescription>
                {getSupabaseStatusLabel()} · 운영자가 가장 자주 쓰는 화면으로 바로
                이동합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {dashboardData.actions.quickLinks.map((link, index) => {
                const Icon = quickLinkIcons[index] ?? ArrowRight;

                return (
                  <button
                    key={link.to}
                    onClick={() => navigate(link.to)}
                    className="flex min-h-24 items-center justify-between rounded-lg border bg-card p-4 text-left transition-colors hover:border-primary/30 hover:bg-muted"
                  >
                    <span>
                      <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="font-medium">{link.label}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                );
              })}
            </CardContent>
          </Card>

          <section className="grid gap-5 2xl:grid-cols-[1.35fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>최근 수신 메시지</CardTitle>
                <CardDescription>
                  수신 원문, 시간, 매칭 결과를 빠르게 확인합니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs text-muted-foreground">
                      <th className="py-3 font-medium">발신자</th>
                      <th className="py-3 font-medium">메시지</th>
                      <th className="py-3 font-medium">수신시간</th>
                      <th className="py-3 font-medium">매칭결과</th>
                      <th className="py-3 font-medium">이동</th>
                    </tr>
                  </thead>
                  <tbody>
                    {view.recentIncoming.map((log) => (
                      <tr key={log.id} className="border-b last:border-0">
                        <td className="py-3 font-medium">{log.sender}</td>
                        <td className="py-3 text-muted-foreground">
                          {log.message}
                        </td>
                        <td className="py-3">{log.receivedAt}</td>
                        <td className="py-3">
                          <Badge variant={log.matched ? "success" : "outline"}>
                            {log.matched ? log.ruleName : "미매칭"}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate("/logs/incoming")}
                          >
                            보기
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TriangleAlert className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                  <CardTitle>최근 발송 실패</CardTitle>
                </div>
                <CardDescription>
                  토큰, 테스트 모드, 권한 문제를 빠르게 감지합니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {view.recentOutgoingFailures.map((failure) => (
                  <button
                    key={failure.id}
                    onClick={() => navigate("/logs/outgoing")}
                    className="w-full rounded-lg border p-4 text-left transition-colors hover:bg-muted"
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="font-medium">{failure.recipient}</span>
                      <Badge variant="destructive">실패</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {failure.ruleName}
                    </p>
                    <p className="mt-1 text-sm">{failure.reason}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {failure.sentAt}
                    </p>
                  </button>
                ))}
              </CardContent>
            </Card>
          </section>
        </div>
      )}
    </PageFrame>
  );
}

function hasDashboardRows(view: DashboardView) {
  return (
    view.recentIncoming.length > 0 || view.recentOutgoingFailures.length > 0
  );
}
