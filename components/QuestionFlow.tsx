"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useState } from "react";
import { requestInterpretation } from "@/lib/client-ai";
import { evaluateInterpretation } from "@/lib/confirm";
import type { ConfirmMethod, Item, Question } from "@/lib/types";
import { UNKNOWN_OPTION } from "@/lib/types";
import { answerLabel, guideHref, withEuro } from "@/lib/flow";

type Mode =
  | { kind: "ask" }
  | { kind: "busy" }
  | { kind: "confirm"; optionId: string }
  | { kind: "retry"; message: string };

export default function QuestionFlow({ item }: { item: Item }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [methods, setMethods] = useState<Record<string, ConfirmMethod>>({});
  const [mode, setMode] = useState<Mode>({ kind: "ask" });
  const [text, setText] = useState("");

  const question: Question | undefined = item.questions[index];

  function settle(optionId: string, method: ConfirmMethod) {
    if (!question) return;
    setAnswers((prev) => ({ ...prev, [question.id]: optionId }));
    setMethods((prev) => ({ ...prev, [question.id]: method }));
    setIndex((prev) => prev + 1);
    setMode({ kind: "ask" });
    setText("");
  }

  function restart() {
    setIndex(0);
    setAnswers({});
    setMethods({});
    setMode({ kind: "ask" });
    setText("");
  }

  async function submitText(event: FormEvent) {
    event.preventDefault();
    const answer = text.trim();
    if (!question || !answer) return;
    setMode({ kind: "busy" });
    const result = await requestInterpretation(item.id, question.id, answer);
    const decision = evaluateInterpretation(question, answer, result);
    if (decision.status === "ask-user") {
      setMode({ kind: "confirm", optionId: decision.optionId });
    } else {
      setMode({
        kind: "retry",
        message: "답변만으로는 확실하지 않아요. 아래에서 골라 주세요.",
      });
    }
  }

  if (!question) {
    return (
      <section aria-label="해석 확인" className="mt-5 rounded-2xl bg-card p-4">
        <h2 className="text-lg font-bold">이렇게 확인했어요</h2>
        <dl className="mt-3 space-y-2">
          {item.questions.map((q) => (
            <div key={q.id} className="flex items-start justify-between gap-3">
              <dt className="text-[15px] text-muted">{q.shortLabel}</dt>
              <dd className="text-right text-[15px] font-bold">
                {answerLabel(q, answers[q.id])}
                {methods[q.id] === "ai-confirmed" && (
                  <span className="ml-1.5 rounded bg-leaf-soft px-1.5 py-0.5 text-xs font-semibold text-leaf-dark">
                    직접 입력
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>
        <Link
          href={guideHref(item.id, answers, methods)}
          className="mt-4 flex h-13 items-center justify-center rounded-xl bg-leaf text-base font-bold text-white"
        >
          배출 방법 보기
        </Link>
        <button
          type="button"
          onClick={restart}
          className="mt-2 h-11 w-full text-sm font-semibold text-muted underline"
        >
          처음부터 다시 답하기
        </button>
      </section>
    );
  }

  const retrying = mode.kind === "retry";
  const buttons = retrying
    ? [...question.options, UNKNOWN_OPTION]
    : question.options;

  return (
    <section aria-label="상태 질문" className="mt-5 rounded-2xl bg-card p-4">
      <p className="text-sm font-semibold text-leaf">
        질문 {index + 1} / {item.questions.length}
      </p>
      <h2 className="mt-1 text-lg leading-snug font-bold">{question.text}</h2>

      {mode.kind === "confirm" ? (
        <div className="mt-4">
          <p className="rounded-xl bg-leaf-soft p-3 text-[15px] leading-relaxed font-semibold text-leaf-dark">
            {question.shortLabel}: {withEuro(answerLabel(question, mode.optionId))}{" "}
            이해했어요. 맞나요?
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => settle(mode.optionId, "ai-confirmed")}
              className="h-12 rounded-xl bg-leaf font-bold text-white"
            >
              맞아요
            </button>
            <button
              type="button"
              onClick={() =>
                setMode({
                  kind: "retry",
                  message: "아래에서 맞는 답을 골라 주세요.",
                })
              }
              className="h-12 rounded-xl border-2 border-line font-bold"
            >
              아니에요
            </button>
          </div>
        </div>
      ) : (
        <>
          {retrying && (
            <p role="status" className="mt-3 rounded-xl bg-amber-soft p-3 text-sm leading-relaxed text-amber-ink">
              {mode.message}
            </p>
          )}
          <div className="mt-3 grid gap-2">
            {buttons.map((option) => (
              <button
                key={option.id}
                type="button"
                disabled={mode.kind === "busy"}
                onClick={() => settle(option.id, "direct")}
                className="min-h-12 rounded-xl border-2 border-line px-3 py-2 text-base font-bold disabled:opacity-50"
              >
                {option.label}
              </button>
            ))}
          </div>

          {!retrying && (
            <form onSubmit={submitText} className="mt-4">
              <label className="block text-sm font-bold" htmlFor="free-answer">
                직접 입력
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="free-answer"
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  maxLength={200}
                  disabled={mode.kind === "busy"}
                  placeholder="보이는 대로 적어 주세요"
                  autoComplete="off"
                  className="h-12 min-w-0 flex-1 rounded-xl border-2 border-line bg-paper px-3 text-base focus:border-leaf focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={mode.kind === "busy" || text.trim() === ""}
                  className="h-12 shrink-0 rounded-xl bg-ink px-4 font-bold text-white disabled:opacity-40"
                >
                  {mode.kind === "busy" ? "확인 중" : "확인"}
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </section>
  );
}
