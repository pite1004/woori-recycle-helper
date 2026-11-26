import Link from "next/link";
import { clearRecognition } from "@/lib/client-ai";
import { getItem, items } from "@/lib/data";
import { guideHref } from "@/lib/flow";
import type { Item } from "@/lib/types";

const QUICK_IDS = [
  "pet-bottle",
  "box",
  "vinyl",
  "can",
  "pot",
  "phone",
  "battery",
  "chair",
];

const STEPS = [
  { title: "찍기", body: "물건을 한 장 찍으면 AI가 품목 후보를 골라요." },
  { title: "확인하기", body: "손잡이·재질처럼 헷갈리는 상태만 물어봐요." },
  { title: "비교·저장", body: "우리 구 방법을 비용 순으로 보고 저장해요." },
];

/** 홈 아래쪽: 자주 버리는 물건 바로가기와 이용 순서 */
export default function HomeExtras() {
  const quick = QUICK_IDS.map(getItem).filter(
    (item): item is Item => item !== undefined,
  );

  return (
    <>
      <section className="mt-8">
        <div className="flex items-baseline justify-between">
          <h2 className="text-base font-bold">자주 버리는 물건</h2>
          <Link
            href="/identify"
            onClick={clearRecognition}
            className="text-sm font-semibold text-leaf underline"
          >
            전체 {items.length}개 보기
          </Link>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {quick.map((item) => (
            <Link
              key={item.id}
              href={
                item.questions.length === 0
                  ? guideHref(item.id)
                  : `/identify?item=${item.id}`
              }
              onClick={clearRecognition}
              className="flex min-h-16 items-center justify-center rounded-2xl border border-line bg-card px-1 py-2 text-center text-sm leading-tight font-bold"
            >
              {item.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-2xl bg-leaf-soft p-4">
        <h2 className="text-base font-bold text-leaf-dark">이렇게 도와드려요</h2>
        <ol className="mt-3 space-y-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-leaf text-sm font-bold text-white">
                {index + 1}
              </span>
              <p className="text-[15px] leading-snug">
                <span className="font-bold">{step.title}</span>
                <br />
                <span className="text-muted">{step.body}</span>
              </p>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs leading-relaxed text-muted">
          안내는 구청 공식 페이지를 기준으로 하고, 각 안내에 출처와 확인일을
          적어 두었어요.
        </p>
      </section>
    </>
  );
}
