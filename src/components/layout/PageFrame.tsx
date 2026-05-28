// 페이지 제목과 목업 상태 전환 영역을 제공합니다.
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RotateCw,
  SearchX,
} from "lucide-react";
import { ReactNode } from "react";
import { PageState } from "../../lib/mock-state";
import { cn } from "../../lib/utils";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

type PageFrameProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  state: PageState;
  onReload: () => void;
  onShowSuccess: () => void;
  onShowEmpty: () => void;
  onShowError: () => void;
  children: ReactNode;
};

export function PageFrame({
  title,
  subtitle,
  actions,
  state,
  onReload,
  onShowSuccess,
  onShowEmpty,
  onShowError,
  children,
}: PageFrameProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="space-y-5"
    >
      <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-start 2xl:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-normal text-foreground">
              {title}
            </h1>
            <StateBadge state={state} />
          </div>
          {subtitle ? (
            <p className="max-w-3xl text-sm text-muted-foreground">
              {subtitle}
            </p>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-md border bg-card p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onReload}
              title="loading 상태 다시 보기"
            >
              <RotateCw className="h-3.5 w-3.5" />
              로딩
            </Button>
            <Button
              variant={state === "success" ? "secondary" : "ghost"}
              size="sm"
              onClick={onShowSuccess}
              title="success 상태 보기"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              성공
            </Button>
            <Button
              variant={state === "empty" ? "secondary" : "ghost"}
              size="sm"
              onClick={onShowEmpty}
              title="empty 상태 보기"
            >
              <SearchX className="h-3.5 w-3.5" />
              빈 상태
            </Button>
            <Button
              variant={state === "error" ? "secondary" : "ghost"}
              size="sm"
              onClick={onShowError}
              title="error 상태 보기"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              오류
            </Button>
          </div>
          {actions}
        </div>
      </div>
      {children}
    </motion.div>
  );
}

function StateBadge({ state }: { state: PageState }) {
  const stateMap = {
    initial: { label: "initial", variant: "secondary" as const },
    loading: { label: "loading", variant: "warning" as const },
    success: { label: "success", variant: "success" as const },
    empty: { label: "empty", variant: "outline" as const },
    error: { label: "error", variant: "destructive" as const },
  };
  const current = stateMap[state];

  return <Badge variant={current.variant}>{current.label}</Badge>;
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex min-h-52 flex-col items-center justify-center gap-3 text-center">
        <SearchX className="h-9 w-9 text-muted-foreground" />
        <div>
          <p className="font-semibold">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        {action}
      </CardContent>
    </Card>
  );
}

export function ErrorState({
  title = "문제가 발생했습니다. 다시 시도해주세요.",
  description,
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry: () => void;
}) {
  return (
    <Card className="border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10">
      <CardContent className="flex min-h-48 flex-col items-start justify-center gap-3">
        <div className="flex items-center gap-2 text-red-700 dark:text-red-200">
          <AlertTriangle className="h-5 w-5" />
          <p className="font-semibold">{title}</p>
        </div>
        {description ? (
          <p className="text-sm text-red-700/80 dark:text-red-200/80">
            {description}
          </p>
        ) : null}
        <Button variant="destructive" onClick={onRetry}>
          <RotateCw className="h-4 w-4" />
          다시 시도
        </Button>
      </CardContent>
    </Card>
  );
}

export function LoadingBlock({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "grid gap-3 rounded-lg border bg-card p-4",
            rows > 3 ? "grid-cols-5" : "grid-cols-3",
          )}
        >
          {Array.from({ length: rows > 3 ? 5 : 3 }).map((__, cellIndex) => (
            <div
              key={cellIndex}
              className="h-4 animate-pulse rounded-md bg-muted"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function LoadingCard() {
  return (
    <Card>
      <CardContent className="flex min-h-44 items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        로딩 중입니다.
      </CardContent>
    </Card>
  );
}
