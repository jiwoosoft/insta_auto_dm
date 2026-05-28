// 관리자 앱의 고정 헤더와 사이드바를 구성합니다.
import {
  FlaskConical,
  Inbox,
  LayoutDashboard,
  ListChecks,
  Moon,
  Send,
  Sun,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

const navItems = [
  { label: "대시보드", to: "/", icon: LayoutDashboard },
  { label: "규칙 관리", to: "/rules", icon: ListChecks },
  { label: "수신 로그", to: "/logs/incoming", icon: Inbox },
  { label: "발송 로그", to: "/logs/outgoing", icon: Send },
  { label: "테스트", to: "/test", icon: FlaskConical },
];

type ThemeMode = "light" | "dark";

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.localStorage.getItem("theme-mode") === "dark"
    ? "dark"
    : "light";
}

export function AppShell() {
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const isDark = theme === "dark";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem("theme-mode", theme);
  }, [isDark, theme]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              DM
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Instagram DM Admin
              </p>
              <p className="text-xs text-muted-foreground">
                Auto reply control panel
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              title={isDark ? "라이트모드로 전환" : "다크모드로 전환"}
            >
              {isDark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              {isDark ? "라이트" : "다크"}
            </Button>
            <Badge variant="success">Local Mock Run</Badge>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 border-r bg-card px-4 py-5 lg:block">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  [
                    "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  ].join(" ")
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="flex min-h-[calc(100vh-4rem)] min-w-0 flex-1 flex-col">
          <main className="min-w-0 flex-1 px-5 py-6 lg:pl-6 lg:pr-12">
            <div className="mx-auto w-full max-w-7xl">
              <Outlet />
            </div>
          </main>
          <footer className="border-t bg-card px-6 py-4 text-xs text-muted-foreground">
            Mock UI for local internal testing
          </footer>
        </div>
      </div>
    </div>
  );
}
