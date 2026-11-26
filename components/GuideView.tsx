"use client";

import Link from "next/link";
import { useState } from "react";
import { answerLabel } from "@/lib/flow";
import { findRules, formatCost } from "@/lib/rules";
import { saveRecord } from "@/lib/storage";
import type {
  ConfirmMethod,
  DisposalRule,
  Item,
  Region,
  SavedRecord,
} from "@/lib/types";
import { UNKNOWN_OPTION } from "@/lib/types";

const NEEDS_CHECK = "확인 필요";

function Field({ label, value }: { label: string; value: string }) {
  const missing = value === NEEDS_CHECK;
  return (
    <div className="grid grid-cols-[5.25rem_1fr] gap-2 border-t border-line py-2.5">
      <dt className="text-sm font-semibold text-muted">{label}</dt>
      <dd className="text-[15px] leading-relaxed whitespace-pre-line">
        {missing ? (
          <span className="rounded bg-amber-soft px-1.5 py-0.5 text-sm font-bold text-amber-ink">
            {NEEDS_CHECK}
          </span>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

function RuleDetail({ rule }: { rule: DisposalRule }) {
  return (
    <section aria-label="상세 안내" className="mt-4 rounded-2xl bg-card p-4">
      <h2 className="text-lg font-bold">{rule.method}</h2>
      <dl className="mt-3">
        <Field label="분류" value={rule.category} />
        <Field label="봉투·스티커" value={rule.bagOrSticker} />
        <Field label="배출 요일" value={rule.days} />
        <Field label="배출 시간" value={rule.time} />
        <Field label="배출 장소" value={rule.place} />
        <Field
          label="비용"
          value={`${formatCost(rule.costWon)}${rule.costNote ? ` · ${rule.costNote}` : ""}`}
        />
        <div className="grid grid-cols-[5.25rem_1fr] gap-2 border-t border-line py-2.5">
          <dt className="text-sm font-semibold text-muted">주의사항</dt>
          <dd>
            {rule.cautions.length > 0 ? (
              <ul className="list-disc space-y-1 pl-4 text-[15px] leading-relaxed">
                {rule.cautions.map((caution) => (
                  <li key={caution}>{caution}</li>
                ))}
              </ul>
            ) : (
              <span className="text-[15px] text-muted">안내된 내용이 없어요</span>
            )}
          </dd>
        </div>
        <div className="grid grid-cols-[5.25rem_1fr] gap-2 border-t border-line py-2.5">
          <dt className="text-sm font-semibold text-muted">출처·확인일</dt>
          <dd className="text-sm leading-relaxed">
            <a
              href={rule.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-leaf underline"
            >
              {rule.sourceTitle}
            </a>
            <br />
            {rule.checkedAt} 확인
          </dd>
        </div>
      </dl>
    </section>
  );
}

function Contact({ region }: { region: Region }) {
  return (
    <p className="mt-4 text-sm leading-relaxed text-muted">
      ‘확인 필요’ 항목과 궁금한 점은 {region.contactName}(
      <a href={`tel:${region.contactPhone}`} className="font-bold text-ink underline">
        {region.contactPhone}
      </a>
      )에 문의해 주세요.
    </p>
  );
}

type Props = {
  item: Item;
  region: Region;
  answers: Record<string, string>;
  confirmMethod: Record<string, ConfirmMethod>;
  /** 내 기록에서 연 경우. 있으면 저장 당시 선택으로 고정해 보여 준다 */
  record?: SavedRecord;
};

export default function GuideView({
  item,
  region,
  answers,
  confirmMethod,
  record,
}: Props) {
  const result = findRules(region.code, item.id, answers);
  const firstRuleId = result.rules[0]?.id ?? null;
  const [chosen, setChosen] = useState<string | null>(
    record ? record.chosenRuleId : firstRuleId,
  );
  const [saveState, setSaveState] = useState<"idle" | "saved" | "failed">("idle");
  const [recordId] = useState<string | null>(record?.id ?? null);

  const readOnly = record !== undefined;
  const chosenRule = result.rules.find((rule) => rule.id === chosen);
  const ruleMissing = readOnly && record.chosenRuleId !== null && !chosenRule;
  const unknownQuestions = item.questions.filter(
    (question) => answers[question.id] === UNKNOWN_OPTION.id,
  );

  function save() {
    const saved = saveRecord({
      id: recordId ?? crypto.randomUUID(),
      itemId: item.id,
      regionCode: region.code,
      answers,
      confirmMethod,
      chosenRuleId: chosenRule?.id ?? null,
      savedAt: new Date().toISOString(),
    });
    setSaveState(saved ? "saved" : "failed");
  }

  return (
    <div>
      {readOnly && (
        <p className="mb-3 rounded-xl bg-leaf-soft px-4 py-2.5 text-sm font-semibold text-leaf-dark">
          {new Date(record.savedAt).toLocaleString("ko-KR")}에 저장한 안내예요
        </p>
      )}

      <p className="text-sm font-semibold text-leaf">{region.name}</p>
      <h1 className="mt-1 text-2xl leading-snug font-bold">{item.name}</h1>

      {item.questions.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {item.questions.map((question) => (
            <li
              key={question.id}
              className="rounded-full bg-desk px-2.5 py-1 text-[13px] font-semibold"
            >
              {question.shortLabel}: {answerLabel(question, answers[question.id])}
            </li>
          ))}
        </ul>
      )}

      {unknownQuestions.length > 0 && (
        <p className="mt-3 rounded-xl bg-amber-soft p-3 text-sm leading-relaxed text-amber-ink">
          {unknownQuestions.map((q) => q.shortLabel).join(", ")} 상태를 확인하면
          방법과 비용이 달라질 수 있어요.
        </p>
      )}

      {ruleMissing && (
        <p role="alert" className="mt-3 rounded-xl bg-danger-soft p-3 text-sm leading-relaxed text-danger-ink">
          저장할 때 고른 방법이 규칙 데이터에서 사라졌어요. 구청에 다시
          확인해 주세요.
        </p>
      )}

      {result.status === "none" ? (
        <section className="mt-5 rounded-2xl bg-card p-4">
          <h2 className="text-lg font-bold">확인된 규칙이 없어요</h2>
          <p className="mt-2 text-[15px] leading-relaxed">
            {region.name}의 공식 안내에서 이 경우의 배출 방법을 확인하지
            못했어요. 구청에 문의해 주세요.
          </p>
          <p className="mt-3 text-[15px]">
            {region.contactName}
            <br />
            <a href={`tel:${region.contactPhone}`} className="text-lg font-bold text-leaf underline">
              {region.contactPhone}
            </a>
          </p>
          <a
            href={region.contactUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-sm font-semibold text-leaf underline"
          >
            구청 안내 페이지 열기
          </a>
        </section>
      ) : (
        <>
          <h2 className="mt-6 text-sm font-bold text-muted">
            허용된 방법 {result.rules.length}개 · 비용 낮은 순
          </h2>
          <ul className="mt-2 space-y-2">
            {result.rules.map((rule) => {
              const selected = rule.id === chosen;
              return (
                <li key={rule.id}>
                  <button
                    type="button"
                    onClick={() => setChosen(rule.id)}
                    disabled={readOnly}
                    aria-pressed={selected}
                    className={`flex min-h-16 w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left ${
                      selected
                        ? "border-leaf bg-leaf-soft"
                        : "border-line bg-card disabled:opacity-60"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`size-5 shrink-0 rounded-full border-2 ${
                        selected ? "border-[6px] border-leaf" : "border-line"
                      }`}
                    />
                    <span className="min-w-0 flex-1 text-base font-bold">
                      {rule.method}
                    </span>
                    <span
                      className={`shrink-0 text-base font-bold ${
                        rule.costWon === null ? "text-amber-ink" : "text-leaf-dark"
                      }`}
                    >
                      {formatCost(rule.costWon)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {chosenRule && <RuleDetail rule={chosenRule} />}
          <Contact region={region} />
        </>
      )}

      {!readOnly && (
        <div className="mt-5">
          {saveState === "failed" && (
            <p role="alert" className="mb-2 rounded-xl bg-danger-soft p-3 text-sm text-danger-ink">
              저장하지 못했어요. 안내는 그대로 있으니 다시 저장해 주세요.
            </p>
          )}
          {saveState === "saved" ? (
            <div role="status" className="rounded-xl bg-leaf-soft p-4">
              <p className="font-bold text-leaf-dark">내 기록에 저장했어요</p>
              <Link
                href="/records"
                className="mt-2 flex h-12 items-center justify-center rounded-xl bg-leaf font-bold text-white"
              >
                내 기록 보기
              </Link>
            </div>
          ) : (
            <button
              type="button"
              onClick={save}
              className="h-13 w-full rounded-xl bg-leaf text-base font-bold text-white"
            >
              {saveState === "failed" ? "다시 저장" : "내 기록에 저장"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
