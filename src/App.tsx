// 고정된 관리자 목업 라우트를 선언합니다.
import { Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { AppShell } from "./components/layout/AppShell";
import DashboardPage from "./pages/DashboardPage";
import IncomingLogsPage from "./pages/IncomingLogsPage";
import OutgoingLogsPage from "./pages/OutgoingLogsPage";
import RuleDetailPage from "./pages/RuleDetailPage";
import RuleNewPage from "./pages/RuleNewPage";
import RulesPage from "./pages/RulesPage";
import TestPage from "./pages/TestPage";

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="/rules" element={<RulesPage />} />
          <Route path="/rules/new" element={<RuleNewPage />} />
          <Route path="/rules/:ruleId" element={<RuleDetailPage />} />
          <Route path="/logs/incoming" element={<IncomingLogsPage />} />
          <Route path="/logs/outgoing" element={<OutgoingLogsPage />} />
          <Route path="/test" element={<TestPage />} />
        </Route>
      </Routes>
      <Toaster richColors position="top-right" />
    </>
  );
}
