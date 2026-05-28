// 페이지별 목업 상태 전이를 관리합니다.
import { useCallback, useEffect, useState } from "react";

export type MockMode = "success" | "empty" | "error";
export type PageState = "initial" | "loading" | MockMode;

export function normalizeMockMode(mode?: string): MockMode {
  if (mode === "empty" || mode === "error") {
    return mode;
  }

  return "success";
}

export function useMockPageState(defaultMode: MockMode = "success") {
  const [state, setState] = useState<PageState>("initial");

  const load = useCallback(
    (nextMode = defaultMode) => {
      setState("loading");
      const timer = window.setTimeout(() => setState(nextMode), 620);

      return () => window.clearTimeout(timer);
    },
    [defaultMode],
  );

  useEffect(() => load(defaultMode), [defaultMode, load]);

  return {
    state,
    setState,
    reload: () => load(defaultMode),
    showSuccess: () => setState("success"),
    showEmpty: () => setState("empty"),
    showError: () => setState("error"),
  };
}
