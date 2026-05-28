// 운영 현황 대시보드 화면을 렌더링합니다.
import {
  ArrowRight,
  FlaskConical,
  Inbox,
  ListChecks,
  MessageSquarePlus,
  TriangleAlert,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
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
import { normalizeMockMode, useMockPageState } from "../lib/mock-state";

const quickLinkIcons = [MessageSquarePlus, ListChecks, Inbox, FlaskConical];

export default function DashboardPage() {
  const navigate = useNavigate();
  const mock = useMockPageState(normalizeMockMode(dashboardData.__mock.mode));
  const hasRecentData =
    dashboardData.view.recentIncoming.length > 0 ||
    dashboardData.view.recentOutgoingFailures.length > 0;

  return (
    <PageFrame
      title={dashboardData.page.title}
      subtitle={dashboardData.page.subtitle}
      state={mock.state}
      onReload={mock.reload}
      onShowSuccess={mock.showSuccess}
      onShowEmpty={mock.showEmpty}
      onShowError={mock.showError}
    >
      {mock.state === "initial" || mock.state === "loading" ? (
        <LoadingBlock rows={4} />
      ) : mock.state === "error" ? (
        <ErrorState
          description="대시보드 더미 데이터를 표시하지 못한 상태입니다."
          onRetry={mock.reload}
        />
      ) : mock.state === "empty" || !hasRecentData ? (
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
            {dashboardData.view.kpis.map((kpi) => (
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
                운영자가 가장 자주 쓰는 화면으로 바로 이동합니다.
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
                    {dashboardData.view.recentIncoming.map((log) => (
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
                  <TriangleAlert className="h-4 w-4 text-amber-600" />
                  <CardTitle>최근 발송 실패</CardTitle>
                </div>
                <CardDescription>
                  토큰, 테스트 모드, 권한 문제를 빠르게 감지합니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardData.view.recentOutgoingFailures.map((failure) => (
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
