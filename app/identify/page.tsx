"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ItemPicker from "@/components/ItemPicker";
import QuestionFlow from "@/components/QuestionFlow";
import { getRecognition } from "@/lib/client-ai";
import { getItem } from "@/lib/data";
import { guideHref } from "@/lib/flow";
import type { Item } from "@/lib/types";

export default function IdentifyPage() {
  const router = useRouter();
  const [recognition] = useState(getRecognition);
  const [itemId, setItemId] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  const candidates = (recognition?.candidates ?? [])
    .map(getItem)
    .filter((item): item is Item => item !== undefined);
  const item = itemId ? getItem(itemId) : undefined;
  const hasCandidates = candidates.length > 0;
  const showPicker = searching || (!hasCandidates && !item);

  function pick(nextId: string) {
    // 품목이 바뀌면 QuestionFlow가 key로 새로 만들어져 이전 답변이 초기화된다
    setItemId(nextId);
    setSearching(false);
    const next = getItem(nextId);
    if (next && next.questions.length === 0) router.push(guideHref(nextId));
  }

  return (
    <section>
      <h1 className="text-2xl leading-snug font-bold">
        {hasCandidates ? "이 물건이 맞나요?" : "어떤 물건을 버리시나요?"}
      </h1>

      {recognition?.failed && (
        <p role="alert" className="mt-3 rounded-xl bg-amber-soft p-3 text-[15px] leading-relaxed text-amber-ink">
          사진으로 품목을 찾지 못했어요. 직접 골라 주세요.
        </p>
      )}

      {hasCandidates && (
        <div className="mt-4">
          <p className="text-sm text-muted">
            AI가 고른 후보예요. 틀릴 수 있으니 확인해 주세요.
          </p>
          <ul className="mt-3 space-y-2">
            {candidates.map((candidate) => {
              const selected = candidate.id === itemId;
              return (
                <li key={candidate.id}>
                  <button
                    type="button"
                    onClick={() => pick(candidate.id)}
                    aria-pressed={selected}
                    className={`flex min-h-14 w-full items-center justify-between rounded-xl border-2 px-4 py-3 text-left text-[17px] font-bold ${
                      selected
                        ? "border-leaf bg-leaf-soft text-leaf-dark"
                        : "border-line bg-card"
                    }`}
                  >
                    {candidate.name}
                    <span className="text-xs font-semibold text-muted">
                      {candidate.group}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {!searching && (
            <button
              type="button"
              onClick={() => setSearching(true)}
              className="mt-2 h-11 w-full text-[15px] font-semibold text-leaf underline"
            >
              후보에 없어요, 직접 검색할게요
            </button>
          )}
        </div>
      )}

      {showPicker && (
        <div className="mt-5">
          <ItemPicker onPick={pick} />
        </div>
      )}

      {item && !hasCandidates && !searching && (
        <div className="mt-5 flex items-center justify-between gap-3 rounded-xl bg-leaf-soft px-4 py-3">
          <p className="text-[15px] font-bold text-leaf-dark">
            선택한 품목: {item.name}
          </p>
          <button
            type="button"
            onClick={() => setSearching(true)}
            className="shrink-0 text-sm font-semibold text-leaf underline"
          >
            품목 바꾸기
          </button>
        </div>
      )}

      {item && item.questions.length > 0 && (
        <QuestionFlow key={item.id} item={item} />
      )}
    </section>
  );
}
