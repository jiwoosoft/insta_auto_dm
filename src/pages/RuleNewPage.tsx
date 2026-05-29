// 새 자동응답 규칙을 Supabase 또는 로컬 목업 상태로 생성합니다.
import { Check, Plus, X } from "lucide-react";
import { KeyboardEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ruleNewData from "../../public/data/routes/rule-new.json";
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
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { normalizeMockMode, useMockPageState } from "../lib/mock-state";
import {
  createRule,
  getSupabaseStatusLabel,
  isSupabaseConfigured,
  MatchType,
  RuleFormInput,
} from "../lib/supabase-rest";
import { cn } from "../lib/utils";

type FormErrors = Partial<Record<"name" | "keywords" | "replyText", string>>;

const usesSupabase = isSupabaseConfigured();

export default function RuleNewPage() {
  const navigate = useNavigate();
  const mock = useMockPageState(normalizeMockMode(ruleNewData.__mock.mode));
  const defaults = ruleNewData.view.form;
  const [keywordDraft, setKeywordDraft] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [form, setForm] = useState<RuleFormInput>({
    name: defaults.defaultName,
    description: defaults.defaultDescription,
    matchType: defaults.defaultMatchType as MatchType,
    keywords: defaults.defaultKeywords,
    replyText: defaults.defaultReplyText,
    replyLink: defaults.defaultReplyLink,
    priority: defaults.defaultPriority,
    isActive: defaults.defaultActive,
  });
  const visibleKeywords = mock.state === "empty" ? [] : form.keywords;

  function updateForm<T extends keyof RuleFormInput>(
    key: T,
    value: RuleFormInput[T],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function addKeyword() {
    const nextKeyword = keywordDraft.trim();
    if (!nextKeyword) {
      return;
    }

    setForm((current) => {
      if (current.keywords.includes(nextKeyword)) {
        return current;
      }

      return { ...current, keywords: [...current.keywords, nextKeyword] };
    });
    setKeywordDraft("");
    mock.showSuccess();
  }

  function removeKeyword(keyword: string) {
    setForm((current) => ({
      ...current,
      keywords: current.keywords.filter((item) => item !== keyword),
    }));
  }

  function onKeywordKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      addKeyword();
    }
  }

  function validate() {
    const nextErrors: FormErrors = {};
    if (!form.name.trim()) {
      nextErrors.name = "규칙명을 입력하세요.";
    }
    if (form.keywords.length === 0) {
      nextErrors.keywords = "트리거 키워드를 1개 이상 추가하세요.";
    }
    if (!form.replyText.trim()) {
      nextErrors.replyText = "응답 텍스트를 입력하세요.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function save(goList: boolean) {
    if (!validate()) {
      toast.error("필수 입력값을 확인해주세요.");
      return;
    }

    setIsSaving(true);
    try {
      if (usesSupabase) {
        const created = await createRule(form);
        toast.success("새 규칙이 Supabase에 저장되었습니다.");
        navigate(goList ? "/rules" : `/rules/${created.id}`);
        return;
      }

      toast.error("Supabase 환경변수가 없어 새 규칙을 실제 DB에 저장할 수 없습니다.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "규칙 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <PageFrame
      title={ruleNewData.page.title}
      subtitle={ruleNewData.page.subtitle}
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
          description="새 규칙 폼 더미 데이터를 표시하지 못한 상태입니다."
          onRetry={mock.reload}
        />
      ) : (
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
              <CardDescription>{getSupabaseStatusLabel()}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 xl:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium">규칙명</span>
                <Input
                  value={form.name}
                  onChange={(event) => updateForm("name", event.target.value)}
                  className={cn(errors.name && "border-red-400")}
                  placeholder="예: 가격 문의 응답"
                />
                {errors.name ? (
                  <p className="text-xs text-red-600">{errors.name}</p>
                ) : null}
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">매칭 방식</span>
                <Select
                  value={form.matchType}
                  onChange={(event) =>
                    updateForm("matchType", event.target.value as MatchType)
                  }
                >
                  <option value="contains">포함</option>
                  <option value="exact">완전 일치</option>
                </Select>
              </label>
              <label className="space-y-2 xl:col-span-2">
                <span className="text-sm font-medium">설명</span>
                <Input
                  value={form.description}
                  onChange={(event) =>
                    updateForm("description", event.target.value)
                  }
                  placeholder="규칙의 용도 메모"
                />
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>트리거 키워드</CardTitle>
              <CardDescription>
                DM 원문에 포함될 단어를 태그로 관리합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {visibleKeywords.map((keyword) => (
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
                {visibleKeywords.length === 0 ? (
                  <span className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
                    표시할 키워드가 없습니다.
                  </span>
                ) : null}
              </div>
              <div className="flex max-w-xl gap-2">
                <Input
                  value={keywordDraft}
                  onChange={(event) => setKeywordDraft(event.target.value)}
                  onKeyDown={onKeywordKeyDown}
                  placeholder="키워드 입력 후 Enter"
                  className={cn(errors.keywords && "border-red-400")}
                />
                <Button type="button" variant="secondary" onClick={addKeyword}>
                  <Plus className="h-4 w-4" />
                  추가
                </Button>
              </div>
              {errors.keywords ? (
                <p className="text-xs text-red-600">{errors.keywords}</p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>응답 설정</CardTitle>
              <CardDescription>
                매칭 시 발송될 문구와 선택 링크를 입력합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="space-y-2">
                <span className="text-sm font-medium">응답 텍스트</span>
                <Textarea
                  value={form.replyText}
                  onChange={(event) =>
                    updateForm("replyText", event.target.value)
                  }
                  className={cn(errors.replyText && "border-red-400")}
                  placeholder="자동으로 발송될 답변"
                />
                {errors.replyText ? (
                  <p className="text-xs text-red-600">{errors.replyText}</p>
                ) : null}
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">응답 링크</span>
                <Input
                  value={form.replyLink}
                  onChange={(event) =>
                    updateForm("replyLink", event.target.value)
                  }
                  placeholder="https://example.com"
                />
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>운영 설정</CardTitle>
              <CardDescription>
                저장 직후 작동 여부와 규칙 충돌 시 적용 순서를 정합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-[220px_1fr]">
              <div className="space-y-2">
                <span className="text-sm font-medium">활성 여부</span>
                <Button
                  type="button"
                  variant={form.isActive ? "secondary" : "outline"}
                  onClick={() => updateForm("isActive", !form.isActive)}
                >
                  {form.isActive ? <Check className="h-4 w-4" /> : null}
                  {form.isActive ? "활성" : "비활성"}
                </Button>
              </div>
              <label className="space-y-2">
                <span className="text-sm font-medium">우선순위</span>
                <Input
                  type="number"
                  value={form.priority}
                  min={1}
                  onChange={(event) =>
                    updateForm("priority", Number(event.target.value))
                  }
                />
              </label>
            </CardContent>
          </Card>

          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={() => navigate("/rules")}>
              {ruleNewData.actions.cancelLabel}
            </Button>
            <Button
              variant="secondary"
              disabled={isSaving}
              onClick={() => void save(true)}
            >
              {ruleNewData.actions.submitAndListLabel}
            </Button>
            <Button disabled={isSaving} onClick={() => void save(false)}>
              {isSaving ? "저장 중" : ruleNewData.actions.submitLabel}
            </Button>
          </div>
        </div>
      )}
    </PageFrame>
  );
}
