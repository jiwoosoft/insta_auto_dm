# 사용자 프롬프트 보관. 2026-05-29

이 문서는 사용자의 요청에 따라 현재 세션에서 사용자가 전달한 프롬프트를 보관한다.

텍스트로 전달된 프롬프트는 아래 원문 블록에 그대로 옮겼다. 이미지 첨부만 있었던 메시지는 세션 안에서 원본 이미지 파일 경로를 확인할 수 없어 첨부 사실과 화면에서 확인 가능한 오류 맥락을 기록했다.

## 프롬프트 1

~~~~~text
/goal [PRD.md](docs/PRD.md) 의 서비스에 대한 프론트 앤드 목업을 먼저 개발할거야.
[router-design.md](docs/front_mockup_docs/router-design.md) 는 라우터 참고해줘.
------
[frontend-mockup-prompt.md](docs/front_mockup_docs/frontend-mockup-prompt.md) 대로 프론트엔드 목업을 만들어야해.
문서에 작성된대로 잘 개발해줘.
~~~~~

## 프롬프트 2

~~~~~text
추가사항으로 다크모드와 라이트모드 기능 추가해줘
~~~~~

## 프롬프트 3

~~~~~text
superbase mcp server 연결해줘
~~~~~

## 프롬프트 4

~~~~~text
사용자 id 와 토큰값 내가 따로 준비해뒀어 입력어떻게 하면되지?
~~~~~

## 프롬프트 5

~~~~~text
<image>
PowerShell에서 `codex mcp remove supabase`를 실행했으나 `codex`가 cmdlet, 함수, 스크립트 파일 또는 실행할 수 있는 프로그램 이름으로 인식되지 않는다는 오류 화면.
</image>
~~~~~

## 프롬프트 6

~~~~~text
적용하고 껏다 켰는데 그다음은?
~~~~~

## 프롬프트 7

~~~~~text
mcp json 코드 아래 내용으로 넣고 싶은데 어디에서 수정가능하지?
===
{
  "mcpServers": {
    "firebase-mcp-server": {
      "command": "npx",
      "args": [
        "-y",
        "firebase-tools@latest",
        "mcp"
      ],
      "env": {},
      "disabled": false
    },
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest"
      ],
      "disabled": false
    },
    "sequential-thinking": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-sequential-thinking"
      ],
      "env": {},
      "disabled": false
    },
    "excel": {
      "command": "npx",
      "args": [
        "--yes",
        "@negokaz/excel-mcp-server"
      ],
      "env": {
        "EXCEL_MCP_PAGING_CELLS_LIMIT": "1000"
      },
      "disabled": false
    },
    "supabase-mcp-server": {
      "$typeName": "exa.cascade_plugins_pb.CascadePluginCommandTemplate",
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--access-token",
        "엑세스 토큰 넣기",
        "--project-ref",
        "프로젝트id넣기"
      ],
      "env": {}
    }
  }
}

~~~~~

## 프롬프트 8

~~~~~text
supabase MCP를 사용해서 현재 목업으로 만들어진 프론트엔드와 연결하기 위한 Supabase의 DB를 먼저 구축할거야.
개발과정에서 우리는 [PRD.md](docs/PRD.md) 의 서비스를 만들고 있다는것을 잊지마.

다음 순서로 개발 진행해줘.
1. Supabase MCP를 사용해서 [schema.sql](docs/db_docs/schema.sql) 의 db 구조로 supabase에 DB의 테이블과 속성을 구축해줘. supabase MCP로 직접 [schema.sql](docs/db_docs/schema.sql) 를 sql editor로 run 시켜서 DB의 테이블과 속성을 새로 만들어야해. [ERD.md](docs/db_docs/ERD.md) , [IA.md](docs/db_docs/IA.md) 와 어긋나지않게 잘 구성되었는지 교차검증도 해줘. 
2. 1번 대로 Supabase의 DB의 테이블과 속성을 처음 생성하는걸 완료한 뒤, [seed_data.sql](docs/db_docs/seed_data.sql) 의 데이터를 시드데이터로 바로 넣어줘. Supabase MCP로 sql editor로 run 하는형태로  [seed_data.sql](docs/db_docs/seed_data.sql) 파일 내용을 그대로 사용해서 마이그레이션 해주면 돼.
~~~~~

## 프롬프트 9

~~~~~text
# AGENTS.md instructions for E:\Solusseum\Users\d2fre\OneDrive\문서\Insta_auto_dm\insta_auto_dm

<INSTRUCTIONS>
# AGENTS.md

Behavioral guidelines for Codex and other coding agents. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## Codex Notes

Codex reads `AGENTS.md` before doing work. Put this file at the project root for repository-wide guidance, or in a nested directory for narrower rules.

Keep this file short and concrete. Codex combines global and project instructions, and large instruction files can crowd out useful task context.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" -> "Write tests for invalid inputs, then make them pass"
- "Fix the bug" -> "Write a test that reproduces it, then make it pass"
- "Refactor X" -> "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] -> verify: [check]
2. [Step] -> verify: [check]
3. [Step] -> verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## 5. Workspace Evidence Before Edits

**Inspect the actual files you will touch. Don't rely on memory or stale summaries.**

Before changing code:
- Use `rg` or project tools to find the relevant implementation.
- Read the exact files and nearby call sites before editing them.
- Treat open editor tabs, filenames, READMEs, and prior conversation summaries as hints, not proof.
- If local code disagrees with your assumption, trust the code and update the plan.

This is not a new "small change" rule. It exists to prevent confident edits based on imagined code.

## 6. Respect The Worktree

**Assume uncommitted changes belong to the user unless you made them.**

When the worktree is dirty:
- Do not revert, overwrite, or reformat unrelated changes.
- If user changes touch the same files, read them and adapt.
- If unrelated files are dirty, ignore them.
- Never run destructive git commands unless the user explicitly asked for them.

## 7. No Closing Colons (Korean Output)

**End Korean sentences with a period, not a colon.**

When the user writes in Korean, your output is also Korean:
- Don't end Korean sentences with `:` even if the next line is a list or example.
- LLMs trained on English docs leak the colon habit into Korean. Catch it.
- The test: every Korean sentence terminator should be `.`, `?`, or `!`, not `:`.
- Colons are fine inside code, key-value pairs, timestamps, or labels. Not as Korean sentence enders.

## 8. File Header Comments in Korean

**First line of every new source file: a one-line Korean comment stating its role.**

When creating a new source file:
- TypeScript/JavaScript: `// 사용자 인증 상태를 관리하는 Context Provider`
- Python: `# KIS API 호출을 비동기로 래핑하는 클라이언트`
- SQL: `-- 일별 집계 결과를 저장하는 머티리얼라이즈드 뷰`
- Place it directly under required directives (`'use client'`, `'use server'`, shebang).
- Skip config files (`*.config.ts`, `package.json`, lockfiles, generated files).

Why: agents read files selectively, not whole codebases. A one-line Korean header gives instant context so the next session can navigate without re-reading everything.

## 9. Plan + Checklist + Context Notes

**Before any non-trivial task, produce three artifacts. Don't start coding without them.**

- **Plan** - what we're building and why.
- **Checklist** (`checklist.md`) - concrete tasks as checkboxes. Tick as you go.
- **Context Notes** (`context-notes.md`) - decisions made during the work and the reasoning behind them. Append continuously.

If the user gives only a plan and asks you to start coding, stop and ask: "Should I create the checklist and context notes first?" The next session needs the notes to pick up without re-deriving every decision.

## 10. Run Tests Before Marking Complete

**If you touched code, run the relevant tests before saying "done".**

- `npm test`, `pytest`, `cargo test`, or whatever the project uses - run the smallest relevant check first, then broader checks when risk is high.
- If tests pass, report the exact command.
- If tests fail, read the actual error, fix it, and re-run.
- If no test setup exists, verify the project builds or typechecks.
- If you cannot run verification, say exactly why.

This is the step coding agents skip most often. Treat it as non-negotiable.

## 11. Verification Evidence In The Final Reply

**Report what you actually verified, not what you intended to verify.**

Final responses should include:
- The command or check that ran, such as `npm test` or `npx tsc --noEmit`.
- The result, such as "passed", "failed with X", or "not run because Y".
- Any remaining risk the user should know about.

Do not write "done", "fixed", or "works" unless that claim is backed by a concrete check.

## 12. Semantic Commits

**Commit when one logical change is complete. Don't wait for the user to ask.**

- The test: "Can I describe this commit in one sentence?" If yes, commit. If no, the changes are still mixed - split them.
- Good: "auth 미들웨어 추가". Bad: "auth 추가하고 UI도 고치고 버그도 수정" (split into 3).
- Don't accumulate unrelated edits and lose the ability to roll back individually.
- Don't commit just to commit - meaningful units only.
- If the environment or user workflow does not allow commits, keep changes uncommitted and clearly summarize them.

Note: For solo prototypes or throwaway scripts, group commits loosely if it slows you down. The point is reversibility, not ceremony.

## 13. Read Errors, Don't Guess

**Read the actual error/log line. Don't pattern-match from memory.**

When something fails:
- Read the full error message and stack trace.
- Check the actual log output, not what you assume it should say.
- Don't apply a "common fix" before confirming the cause.
- If unclear, add a print/log to verify state - then fix.

This is the step coding agents skip most often after "run tests". They guess from error keywords and apply the most recent pattern. That's how a one-line bug becomes a three-file refactor.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, verification is reported with exact checks, and clarifying questions come before implementation rather than after mistakes.
</INSTRUCTIONS>
<environment_context>
  <cwd>E:\Solusseum\Users\d2fre\OneDrive\문서\Insta_auto_dm\insta_auto_dm</cwd>
  <shell>powershell</shell>
  <current_date>2026-05-28</current_date>
  <timezone>Asia/Seoul</timezone>
</environment_context>
~~~~~

## 프롬프트 10

~~~~~text
Supabase DB 초기 구축 계속 진행해줘
~~~~~

## 프롬프트 11

~~~~~text
<environment_context>
  <current_date>2026-05-29</current_date>
  <timezone>Asia/Seoul</timezone>
</environment_context>
~~~~~

## 프롬프트 12

~~~~~text
[edge-function-guide-v3.md](docs/edge-function-guide-v3.md) 를 참고해서 섹션6의 작업을 아래와 같이 순서대로 수행해줘. 

1. supabase MCP의 deploy_edge_function 툴을 사용해서 아래 2개의 edge function을 생성하고 배포해줘.
   - instagram-webhook (verify_jwt: false)
   - test-match (verify_jwt: false)

2. 각 함수의 소스코드는 이 문서의 섹션 6-A, 6-B에 있는 코드를 그대로 사용해줘.

배포 완료 후 두 함수의 URL을 알려줘.
~~~~~

## 프롬프트 13

~~~~~text
현재까지 모든 정보 푸시해주고 내가 너에게 전달해준 프롬프트도 모두 github에 토시하나 틀리지않게 저저장해줘
~~~~~
