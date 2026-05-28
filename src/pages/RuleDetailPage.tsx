// 기존 자동응답 규칙 상세와 수정 폼을 렌더링합니다.
import { Check, Plus, Trash2, X } from "lucide-react";
import { KeyboardEvent, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import ruleDetailData from "../../public/data/routes/rule-detail.json";
import {
  EmptyState,
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
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { normalizeMockMode, useMockPageState } from "../lib/mock-state";

type MatchType = "contains" | "exact";
type Rule = typeof ruleDetailData.view.rule;

export default function RuleDetailPage() {
  const { ruleId } = useParams();
  const navigate = useNavigate();
  const mock = useMockPageState(normalizeMockMode(ruleDetailData.__mock.mode));
  const [keywordDraft, setKeywordDraft] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [rule, setRule] = useState<Rule>({
    ...ruleDetailData.view.rule,
    id: ruleId ?? ruleDetailData.view.rule.id,
  });

  function updateRule<T extends keyof Rule>(key: T, value: Rule[T]) {
    setRule((current) => ({ ...current, [key]: value }));
  }

  function addKeyword() {
    const nextKeyword = keywordDraft.trim();
    if (!nextKeyword) {
      return;
    }

    setRule((current) => {
      if (current.triggerKeywords.includes(nextKeyword)) {
        return current;
      }

      return {
        ...current,
        triggerKeywords: [...current.triggerKeywords, nextKeyword],
      };
    });
    setKeywordDraft("");
  }

  function onKeywordKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      addKeyword();
    }
  }

  function removeKeyword(keyword: string) {
    setRule((current) => ({
      ...current,
      triggerKeywords: current.triggerKeywords.filter(
        (item) => item !== keyword,
      ),
    }));
  }

  function saveRule() {
    toast.success("규칙 수정 내용이 로컬 상태에 저장되었습니다.");
  }

  function toggleActive() {
    setRule((current) => {
      const next = { ...current, isActive: !current.isActive };
      toast.success(`${next.name} 규칙이 ${next.isActive ? "활성" : "비활성"} 상태가 되었습니다.`);

      return next;
    });
  }

  function deleteRule() {
    setShowDeleteDialog(false);
    toast.success("규칙 삭제가 로컬 상태에서 처리되었습니다.");
    navigate("/rules");
  }

  return (
    <PageFrame
      title={ruleDetailData.page.title}
      subtitle={ruleDetailData.page.subtitle}
      state={mock.state}
      onReload={mock.reload}
      onShowSuccess={mock.showSuccess}
      onShowEmpty={mock.showEmpty}
      onShowError={mock.showError}
      actions={
        <Badge variant={rule.isActive ? "success" : "outline"}>
          {rule.isActive ? "활성" : "비활성"}
        </Badge>
      }
    >
      {mock.state === "initial" || mock.state === "loading" ? (
        <LoadingCard />
      ) : mock.state === "error" ? (
        <ErrorState
          description="규칙 상세 더미 데이터를 표시하지 못한 상태입니다."
          onRetry={mock.reload}
        />
      ) : mock.state === "empty" ? (
        <EmptyState
          title="해당 규칙 데이터가 없습니다."
          description="규칙 목록에서 다시 상세 화면으로 진입하세요."
          action={
            <Button onClick={() => navigate("/rules")}>
              규칙 목록으로 돌아가기
            </Button>
          }
        />
      ) : (
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle>{rule.name}</CardTitle>
                <Badge variant="secondary">우선순위 {rule.priority}</Badge>
              </div>
              <CardDescription>규칙 ID: {rule.id}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 xl:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium">규칙명</span>
                <Input
                  value={rule.name}
                  onChange={(event) => updateRule("name", event.target.value)}
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">매칭 방식</span>
                <Select
                  value={rule.matchType}
                  onChange={(event) =>
                    updateRule("matchType", event.target.value as MatchType)
                  }
                >
                  <option value="contains">포함</option>
                  <option value="exact">완전 일치</option>
                </Select>
              </label>
              <label className="space-y-2 xl:col-span-2">
                <span className="text-sm font-medium">설명</span>
                <Input
                  value={rule.description}
                  onChange={(event) =>
                    updateRule("description", event.target.value)
                  }
                />
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>키워드</CardTitle>
              <CardDescription>
                여러 규칙이 동시에 매칭될 때 우선순위가 높은 규칙이 먼저 적용됩니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {rule.triggerKeywords.map((keyword) => (
                  <Badge
                    key={keyword}
                    variant="secondary"
                    className="gap-2 py-1.5"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => removeKeyword(keyword)}
                      title={`${keyword} 키워드 삭제`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex max-w-xl gap-2">
                <Input
                  value={keywordDraft}
                  onChange={(event) => setKeywordDraft(event.target.value)}
                  onKeyDown={onKeywordKeyDown}
                  placeholder="키워드 입력 후 Enter"
                />
                <Button type="button" variant="secondary" onClick={addKeyword}>
                  <Plus className="h-4 w-4" />
                  추가
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>응답 설정</CardTitle>
              <CardDescription>
                실제 발송될 텍스트와 함께 보낼 링크를 조정합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="space-y-2">
                <span className="text-sm font-medium">응답 텍스트</span>
                <Textarea
                  value={rule.replyText}
                  onChange={(event) =>
                    updateRule("replyText", event.target.value)
                  }
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">응답 링크</span>
                <Input
                  value={rule.replyLink}
                  onChange={(event) =>
                    updateRule("replyLink", event.target.value)
                  }
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">우선순위</span>
                <Input
                  type="number"
                  value={rule.priority}
                  min={1}
                  onChange={(event) =>
                    updateRule("priority", Number(event.target.value))
                  }
                />
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>최근 매칭 이력</CardTitle>
              <CardDescription>
                이 규칙이 최근 반응한 DM 목록입니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="py-3 font-medium">발신자</th>
                    <th className="py-3 font-medium">메시지</th>
                    <th className="py-3 font-medium">키워드</th>
                    <th className="py-3 font-medium">시각</th>
                  </tr>
                </thead>
                <tbody>
                  {ruleDetailData.view.recentMatches.map((match) => (
                    <tr key={match.id} className="border-b last:border-0">
                      <td className="py-3 font-medium">{match.sender}</td>
                      <td className="py-3 text-muted-foreground">
                        {match.message}
                      </td>
                      <td className="py-3">
                        <Badge variant="success">{match.matchedKeyword}</Badge>
                      </td>
                      <td className="py-3">{match.receivedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <div className="flex flex-wrap justify-between gap-2">
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4" />
              {ruleDetailData.actions.archiveLabel}
            </Button>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={toggleActive}>
                {rule.isActive ? "비활성화" : "활성화"}
              </Button>
              <Button onClick={saveRule}>
                <Check className="h-4 w-4" />
                {ruleDetailData.actions.saveLabel}
              </Button>
            </div>
          </div>

          {showDeleteDialog ? (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 p-4">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>규칙을 삭제할까요?</CardTitle>
                  <CardDescription>
                    기존 수신과 발송 로그는 보존되는 것으로 시뮬레이션됩니다.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteDialog(false)}
                  >
                    취소
                  </Button>
                  <Button variant="destructive" onClick={deleteRule}>
                    삭제
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>
      )}
    </PageFrame>
  );
}
