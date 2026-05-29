// 기존 자동응답 규칙을 Supabase 또는 로컬 목업 상태로 수정합니다.
import { Check, Plus, Trash2, X } from "lucide-react";
import { KeyboardEvent, useCallback, useEffect, useState } from "react";
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
import {
  normalizeMockMode,
  PageState,
  useMockPageState,
} from "../lib/mock-state";
import {
  deleteRule as deleteRemoteRule,
  getRule,
  getSupabaseStatusLabel,
  isSupabaseConfigured,
  MatchType,
  RuleFormInput,
  RuleView,
  updateRule as updateRemoteRule,
} from "../lib/supabase-rest";

const usesSupabase = isSupabaseConfigured();

function toFallbackRule(ruleId?: string): RuleView {
  const rule = ruleDetailData.view.rule;

  return {
    id: ruleId ?? rule.id,
    name: rule.name,
    description: rule.description,
    matchType: rule.matchType as MatchType,
    keywords: rule.triggerKeywords,
    triggerKeywords: rule.triggerKeywords,
    replyText: rule.replyText,
    replyLink: rule.replyLink,
    priority: rule.priority,
    isActive: rule.isActive,
    updatedAt: rule.updatedAt,
  };
}

function toRuleInput(rule: RuleView): RuleFormInput {
  return {
    name: rule.name,
    description: rule.description,
    matchType: rule.matchType,
    keywords: rule.triggerKeywords,
    replyText: rule.replyText,
    replyLink: rule.replyLink,
    priority: rule.priority,
    isActive: rule.isActive,
  };
}

export default function RuleDetailPage() {
  const { ruleId } = useParams();
  const navigate = useNavigate();
  const mock = useMockPageState(normalizeMockMode(ruleDetailData.__mock.mode));
  const [pageState, setPageState] = useState<PageState>(
    usesSupabase ? "loading" : "initial",
  );
  const [keywordDraft, setKeywordDraft] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [rule, setRule] = useState<RuleView>(toFallbackRule(ruleId));
  const state = usesSupabase ? pageState : mock.state;

  const loadRule = useCallback(async () => {
    if (!usesSupabase) {
      return;
    }
    if (!ruleId) {
      setPageState("empty");
      return;
    }

    setPageState("loading");
    try {
      const remoteRule = await getRule(ruleId);
      if (!remoteRule) {
        setPageState("empty");
        return;
      }

      setRule(remoteRule);
      setPageState("success");
    } catch (error) {
      setPageState("error");
      toast.error(error instanceof Error ? error.message : "규칙 조회에 실패했습니다.");
    }
  }, [ruleId]);

  useEffect(() => {
    void loadRule();
  }, [loadRule]);

  function updateLocalRule<T extends keyof RuleView>(key: T, value: RuleView[T]) {
    setRule((current) => ({ ...current, [key]: value }));
  }

  function setKeywords(keywords: string[]) {
    setRule((current) => ({
      ...current,
      keywords,
      triggerKeywords: keywords,
    }));
  }

  function addKeyword() {
    const nextKeyword = keywordDraft.trim();
    if (!nextKeyword) {
      return;
    }

    setKeywords(
      rule.triggerKeywords.includes(nextKeyword)
        ? rule.triggerKeywords
        : [...rule.triggerKeywords, nextKeyword],
    );
    setKeywordDraft("");
  }

  function onKeywordKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      addKeyword();
    }
  }

  function removeKeyword(keyword: string) {
    setKeywords(rule.triggerKeywords.filter((item) => item !== keyword));
  }

  function validate() {
    if (!rule.name.trim()) {
      toast.error("규칙명을 입력하세요.");
      return false;
    }
    if (rule.triggerKeywords.length === 0) {
      toast.error("트리거 키워드를 1개 이상 추가하세요.");
      return false;
    }
    if (!rule.replyText.trim()) {
      toast.error("응답 텍스트를 입력하세요.");
      return false;
    }

    return true;
  }

  async function saveRule() {
    if (!validate()) {
      return;
    }

    if (!usesSupabase) {
      toast.error("Supabase 환경변수가 없어 규칙 수정 내용을 실제 DB에 저장할 수 없습니다.");
      return;
    }

    setIsSaving(true);
    try {
      const updated = await updateRemoteRule(rule.id, toRuleInput(rule));
      setRule(updated);
      toast.success("규칙 수정 내용이 Supabase에 저장되었습니다.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "규칙 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleActive() {
    if (!usesSupabase) {
      toast.error("Supabase 환경변수가 없어 규칙 활성 상태를 실제 DB에 저장할 수 없습니다.");
      return;
    }

    setIsSaving(true);
    try {
      const updated = await updateRemoteRule(rule.id, {
        isActive: !rule.isActive,
      });
      setRule(updated);
      toast.success(`${updated.name} 규칙이 ${updated.isActive ? "활성" : "비활성"} 상태가 되었습니다.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "규칙 상태 변경에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteRule() {
    if (!usesSupabase) {
      setShowDeleteDialog(false);
      toast.error("Supabase 환경변수가 없어 규칙을 실제 DB에서 삭제할 수 없습니다.");
      return;
    }

    setIsSaving(true);
    try {
      await deleteRemoteRule(rule.id);
      setShowDeleteDialog(false);
      toast.success("규칙이 Supabase에서 삭제되었습니다.");
      navigate("/rules");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "규칙 삭제에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <PageFrame
      title={ruleDetailData.page.title}
      subtitle={ruleDetailData.page.subtitle}
      state={state}
      onReload={usesSupabase ? loadRule : mock.reload}
      onShowSuccess={() => (usesSupabase ? setPageState("success") : mock.showSuccess())}
      onShowEmpty={() => (usesSupabase ? setPageState("empty") : mock.showEmpty())}
      onShowError={() => (usesSupabase ? setPageState("error") : mock.showError())}
      actions={
        <Badge variant={rule.isActive ? "success" : "outline"}>
          {rule.isActive ? "활성" : "비활성"}
        </Badge>
      }
    >
      {state === "initial" || state === "loading" ? (
        <LoadingCard />
      ) : state === "error" ? (
        <ErrorState
          description={
            usesSupabase
              ? "Supabase 규칙 상세를 불러오지 못했습니다. 환경변수와 RLS 정책을 확인하세요."
              : "규칙 상세 더미 데이터를 표시하지 못한 상태입니다."
          }
          onRetry={usesSupabase ? loadRule : mock.reload}
        />
      ) : state === "empty" ? (
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
              <CardDescription>
                {getSupabaseStatusLabel()} · 규칙 ID: {rule.id}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 xl:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium">규칙명</span>
                <Input
                  value={rule.name}
                  onChange={(event) => updateLocalRule("name", event.target.value)}
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">매칭 방식</span>
                <Select
                  value={rule.matchType}
                  onChange={(event) =>
                    updateLocalRule("matchType", event.target.value as MatchType)
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
                    updateLocalRule("description", event.target.value)
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
                    updateLocalRule("replyText", event.target.value)
                  }
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">응답 링크</span>
                <Input
                  value={rule.replyLink}
                  onChange={(event) =>
                    updateLocalRule("replyLink", event.target.value)
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
                    updateLocalRule("priority", Number(event.target.value))
                  }
                />
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>최근 매칭 이력</CardTitle>
              <CardDescription>
                이 목록은 아직 참고용 목업이며 로그 화면 실데이터 연결 단계에서 통합됩니다.
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
              disabled={isSaving}
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4" />
              {ruleDetailData.actions.archiveLabel}
            </Button>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                disabled={isSaving}
                onClick={() => void toggleActive()}
              >
                {rule.isActive ? "비활성화" : "활성화"}
              </Button>
              <Button disabled={isSaving} onClick={() => void saveRule()}>
                <Check className="h-4 w-4" />
                {isSaving ? "저장 중" : ruleDetailData.actions.saveLabel}
              </Button>
            </div>
          </div>

          {showDeleteDialog ? (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 p-4">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>규칙을 삭제할까요?</CardTitle>
                  <CardDescription>
                    기존 수신과 발송 로그는 유지되고 규칙 참조만 비워집니다.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteDialog(false)}
                  >
                    취소
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={isSaving}
                    onClick={() => void deleteRule()}
                  >
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
