// 테스트 문장과 규칙 매칭 결과를 렌더링합니다.
import { ArrowRight, FlaskConical, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import testData from "../../public/data/routes/test.json";
import {
  ErrorState,
  LoadingCard,
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
import { Textarea } from "../components/ui/textarea";
import { normalizeMockMode, useMockPageState } from "../lib/mock-state";

type MockRule = (typeof testData.view.mockRules)[number];
type ResultState = "initial" | "loading" | "success" | "empty" | "error";

export default function TestPage() {
  const navigate = useNavigate();
  const mock = useMockPageState(normalizeMockMode(testData.__mock.mode));
  const [input, setInput] = useState(testData.view.defaultInput);
  const [resultState, setResultState] = useState<ResultState>("initial");
  const [matchedRule, setMatchedRule] = useState<MockRule | null>(null);
  const [matchedKeyword, setMatchedKeyword] = useState("");
  const effectiveResultState =
    mock.state === "empty" ? "empty" : resultState;

  function findMatch(value: string) {
    const normalized = value.trim().toLowerCase();
    const rules = [...testData.view.mockRules].sort(
      (a, b) => b.priority - a.priority,
    );

    for (const rule of rules) {
      const keyword = rule.keywords.find((item) => {
        const normalizedKeyword = item.toLowerCase();

        if (rule.matchType === "exact") {
          return normalized === normalizedKeyword;
        }

        return normalized.includes(normalizedKeyword);
      });

      if (keyword) {
        return { rule, keyword };
      }
    }

    return null;
  }

  function runTest() {
    if (!input.trim()) {
      setResultState("empty");
      setMatchedRule(null);
      toast.error("테스트 문장을 입력해주세요.");
      return;
    }

    setResultState("loading");
    window.setTimeout(() => {
      if (input.includes("오류")) {
        setResultState("error");
        setMatchedRule(null);
        return;
      }

      const result = findMatch(input);

      if (!result) {
        setResultState("empty");
        setMatchedRule(null);
        return;
      }

      setMatchedRule(result.rule);
      setMatchedKeyword(result.keyword);
      setResultState("success");
      toast.success(`${result.rule.ruleName} 규칙이 매칭되었습니다.`);
    }, 520);
  }

  function resetTest() {
    setInput("");
    setMatchedRule(null);
    setMatchedKeyword("");
    setResultState("initial");
  }

  return (
    <PageFrame
      title={testData.page.title}
      subtitle={testData.page.subtitle}
      state={mock.state}
      onReload={mock.reload}
      onShowSuccess={mock.showSuccess}
      onShowEmpty={mock.showEmpty}
      onShowError={mock.showError}
    >
      {mock.state === "initial" || mock.state === "loading" ? (
        <LoadingCard />
      ) : mock.state === "error" ? (
        <ErrorState
          description="테스트 화면 더미 데이터를 표시하지 못한 상태입니다."
          onRetry={mock.reload}
        />
      ) : (
        <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
          <div className="space-y-5">
            <Card>
              <CardHeader>
                <CardTitle>테스트 입력</CardTitle>
                <CardDescription>
                  실제 DM 발송 없이 로컬 상태에서만 매칭 결과를 계산합니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="예: 배송은 얼마나 걸리나요?"
                />
                <div className="flex flex-wrap gap-2">
                  <Button onClick={runTest}>
                    <FlaskConical className="h-4 w-4" />
                    {testData.actions.runLabel}
                  </Button>
                  <Button variant="outline" onClick={resetTest}>
                    <RotateCcw className="h-4 w-4" />
                    {testData.actions.resetLabel}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>추천 예문</CardTitle>
                <CardDescription>
                  주요 문의 유형별 테스트 문장을 빠르게 삽입합니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {testData.view.suggestedExamples.map((example) => (
                  <Button
                    key={example}
                    variant="secondary"
                    onClick={() => {
                      setInput(example);
                      setResultState("initial");
                    }}
                  >
                    {example}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          <ResultCard
            state={effectiveResultState}
            matchedRule={matchedRule}
            matchedKeyword={matchedKeyword}
            onGoRule={() => navigate(`/rules/${matchedRule?.ruleId ?? "price"}`)}
          />
        </div>
      )}
    </PageFrame>
  );
}

function ResultCard({
  state,
  matchedRule,
  matchedKeyword,
  onGoRule,
}: {
  state: ResultState;
  matchedRule: MockRule | null;
  matchedKeyword: string;
  onGoRule: () => void;
}) {
  if (state === "loading") {
    return <LoadingCard />;
  }

  if (state === "empty") {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>{testData.view.resultPreview.empty.title}</CardTitle>
          <CardDescription>
            {testData.view.resultPreview.empty.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="outline">미매칭</Badge>
        </CardContent>
      </Card>
    );
  }

  if (state === "error") {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10">
        <CardHeader>
          <CardTitle className="text-red-700 dark:text-red-200">
            {testData.view.resultPreview.error.title}
          </CardTitle>
          <CardDescription className="text-red-700/80 dark:text-red-200/80">
            {testData.view.resultPreview.error.description}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (state === "success" && matchedRule) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>테스트 결과</CardTitle>
            <Badge variant="success">매칭됨</Badge>
          </div>
          <CardDescription>
            우선순위가 가장 높은 활성 규칙 1개가 적용됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 rounded-md border bg-muted/40 p-4">
            <InfoRow label="매칭 규칙명" value={matchedRule.ruleName} />
            <InfoRow label="반응한 키워드" value={matchedKeyword} />
            <InfoRow label="우선순위" value={String(matchedRule.priority)} />
            <InfoRow label="첨부 링크" value={matchedRule.replyLink || "-"} />
          </div>
          <div className="rounded-md border p-4">
            <p className="text-xs font-medium text-muted-foreground">
              발송 예정 텍스트
            </p>
            <p className="mt-2 text-sm leading-6">{matchedRule.replyText}</p>
          </div>
          <Button onClick={onGoRule}>
            {testData.actions.goRuleLabel}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{testData.view.resultPreview.initial.title}</CardTitle>
        <CardDescription>
          {testData.view.resultPreview.initial.description}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
