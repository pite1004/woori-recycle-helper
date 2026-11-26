import { rules as allRules } from "./data";
import type { DisposalRule, RegionCode } from "./types";

export type RuleResult =
  | { status: "found"; rules: DisposalRule[] }
  | { status: "none"; rules: [] };

function compareCost(a: DisposalRule, b: DisposalRule): number {
  if (a.costWon === null && b.costWon === null) return 0;
  if (a.costWon === null) return 1;
  if (b.costWon === null) return -1;
  return a.costWon - b.costWon;
}

/**
 * 지역·품목·답변에 맞는 배출 방법을 비용 낮은 순으로 돌려준다.
 * 답이 "unknown"이면 그 질문에 의존하는 규칙은 자연히 빠진다.
 */
export function findRules(
  regionCode: RegionCode,
  itemId: string,
  answers: Record<string, string>,
  source: DisposalRule[] = allRules,
): RuleResult {
  const matched = source
    .filter(
      (rule) =>
        rule.regionCode === regionCode &&
        rule.itemId === itemId &&
        rule.allowed === true,
    )
    .filter((rule) =>
      Object.entries(rule.when).every(([key, value]) => answers[key] === value),
    )
    .sort(compareCost);

  if (matched.length === 0) return { status: "none", rules: [] };
  return { status: "found", rules: matched };
}

export function formatCost(costWon: number | null): string {
  if (costWon === null) return "금액 확인 필요";
  if (costWon === 0) return "무료";
  return `${costWon.toLocaleString("ko-KR")}원`;
}
