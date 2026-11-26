import { describe, expect, it } from "vitest";
import { parseCandidates, parseInterpretation } from "@/lib/ai";
import {
  evaluateInterpretation,
  hasUncertainExpression,
  isConfirmed,
} from "@/lib/confirm";
import { getItem, items, regions, rules } from "@/lib/data";
import { findRules, formatCost } from "@/lib/rules";
import { searchItems } from "@/lib/search";
import {
  loadRecords,
  parseRecords,
  parseSettings,
  saveRecord,
  saveSettings,
} from "@/lib/storage";
import type { DisposalRule, Question, SavedRecord } from "@/lib/types";

const MH = "incheon-michuhol" as const;
const YS = "incheon-yeonsu" as const;

function rule(over: Partial<DisposalRule>): DisposalRule {
  return {
    id: "r",
    regionCode: MH,
    itemId: "x",
    when: {},
    allowed: true,
    method: "m",
    category: "c",
    bagOrSticker: "b",
    days: "d",
    time: "t",
    place: "p",
    costWon: 0,
    cautions: [],
    sourceTitle: "s",
    sourceUrl: "https://example.com",
    checkedAt: "2026-11-06",
    ...over,
  };
}

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  };
}

const handle = getItem("frying-pan")!.questions[0] as Question;

describe("findRules", () => {
  it("allowed가 false인 규칙을 제외한다", () => {
    const source = [
      rule({ id: "no", allowed: false }),
      rule({ id: "yes" }),
    ];
    const result = findRules(MH, "x", {}, source);
    expect(result.rules.map((r) => r.id)).toEqual(["yes"]);
  });

  it("다른 지역과 다른 품목의 규칙을 제외한다", () => {
    const source = [
      rule({ id: "other-region", regionCode: YS }),
      rule({ id: "other-item", itemId: "y" }),
      rule({ id: "yes" }),
    ];
    expect(findRules(MH, "x", {}, source).rules.map((r) => r.id)).toEqual(["yes"]);
  });

  it("비용 오름차순으로 정렬하고 null은 맨 뒤로 보낸다", () => {
    const source = [
      rule({ id: "null", costWon: null }),
      rule({ id: "high", costWon: 4000 }),
      rule({ id: "free", costWon: 0 }),
      rule({ id: "low", costWon: 750 }),
    ];
    expect(findRules(MH, "x", {}, source).rules.map((r) => r.id)).toEqual([
      "free",
      "low",
      "high",
      "null",
    ]);
  });

  it("when의 모든 조건이 맞아야 남는다", () => {
    const source = [rule({ id: "both", when: { a: "1", b: "2" } })];
    expect(findRules(MH, "x", { a: "1" }, source).status).toBe("none");
    expect(findRules(MH, "x", { a: "1", b: "2" }, source).status).toBe("found");
  });

  it("unknown이면 상태에 의존하는 규칙이 빠지고 기본 방법만 남는다", () => {
    const result = findRules(MH, "frying-pan", {
      handle: "unknown",
      material: "stainless-iron",
    });
    expect(result.rules.map((r) => r.id)).toEqual(["mh-frying-pan-bag"]);
  });

  it("규칙이 없으면 none 상태를 돌려준다", () => {
    expect(findRules(YS, "blanket", { filling: "cotton" })).toEqual({
      status: "none",
      rules: [],
    });
  });

  it("실제 데이터: 분리되는 스테인리스 팬은 무료 재활용이 먼저 나온다", () => {
    const result = findRules(MH, "frying-pan", {
      handle: "detached",
      material: "stainless-iron",
    });
    expect(result.rules.map((r) => r.costWon)).toEqual([0, 750]);
  });

  it("실제 데이터: 손잡이가 안 빠지면 고철 재활용은 나오지 않는다", () => {
    const result = findRules(MH, "frying-pan", {
      handle: "attached",
      material: "stainless-iron",
    });
    expect(result.rules.every((r) => r.allowed)).toBe(true);
    expect(result.rules.map((r) => r.method)).toEqual(["종량제 봉투"]);
  });

  it("실제 데이터: 같은 품목도 구에 따라 비용이 다르다", () => {
    const answers = { handle: "attached", material: "coated" };
    expect(findRules(MH, "frying-pan", answers).rules[0].costWon).toBe(750);
    expect(findRules(YS, "frying-pan", answers).rules[0].costWon).toBe(870);
  });
});

describe("규칙 데이터 무결성", () => {
  it("모든 규칙에 출처 URL과 확인일이 있다", () => {
    for (const r of rules) {
      expect(r.sourceUrl, r.id).toMatch(/^https:\/\//);
      expect(r.sourceTitle, r.id).not.toBe("");
      expect(r.checkedAt, r.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("규칙 id가 겹치지 않고 지역·품목·조건이 사전에 있다", () => {
    expect(new Set(rules.map((r) => r.id)).size).toBe(rules.length);
    const codes = regions.map((r) => r.code);
    for (const r of rules) {
      expect(codes, r.id).toContain(r.regionCode);
      const item = getItem(r.itemId);
      expect(item, r.id).toBeDefined();
      for (const [key, value] of Object.entries(r.when)) {
        const question = item!.questions.find((q) => q.id === key);
        expect(question, `${r.id}:${key}`).toBeDefined();
        const ids = [...question!.options.map((o) => o.id), "unknown"];
        expect(ids, `${r.id}:${key}`).toContain(value);
      }
    }
  });

  it("허용 안 된 규칙이 필터 검증용으로 들어 있다", () => {
    expect(rules.some((r) => !r.allowed)).toBe(true);
  });

  it("품목 사전이 15개 내외이고 필수 품목을 포함한다", () => {
    expect(items.length).toBeGreaterThanOrEqual(13);
    for (const id of ["electric-kettle", "frying-pan", "broken-glass", "glass-bottle"]) {
      expect(getItem(id), id).toBeDefined();
    }
  });
});

describe("확정 조건", () => {
  const sure = { optionId: "attached", certainty: "확실" as const };

  it("수용 기준 문장은 AI가 확실하다고 해도 미확정이다", () => {
    const decision = evaluateInterpretation(
      handle,
      "나사가 있는데 잘 모르겠어요",
      sure,
    );
    expect(decision).toEqual({ status: "unconfirmed", reason: "uncertain-words" });
  });

  it("조건 1 실패: 선택지에 없는 id", () => {
    expect(
      evaluateInterpretation(handle, "그냥 붙어요", {
        optionId: "glued",
        certainty: "확실",
      }).status,
    ).toBe("unconfirmed");
  });

  it("조건 1 실패: optionId가 null", () => {
    expect(
      evaluateInterpretation(handle, "반쯤 붙어요", {
        optionId: null,
        certainty: "확실",
      }).status,
    ).toBe("unconfirmed");
  });

  it("조건 2 실패: AI가 불확실로 표시", () => {
    expect(
      evaluateInterpretation(handle, "붙어 있어요", {
        optionId: "attached",
        certainty: "불확실",
      }),
    ).toEqual({ status: "unconfirmed", reason: "uncertain-ai" });
  });

  it("조건 2 실패: 앱 쪽 표현 검사", () => {
    for (const text of [
      "모르겠어요",
      "붙은 것 같아요",
      "붙은 것 같은데요",
      "아마 붙어 있어요",
      "글쎄요",
      "애매해요",
      "붙은 듯해요",
    ]) {
      expect(hasUncertainExpression(text), text).toBe(true);
    }
  });

  it("조건 3 실패: 사용자가 [맞아요]를 누르지 않으면 확정이 아니다", () => {
    expect(isConfirmed(handle, "손잡이가 그냥 쭉 붙어 있어요", sure, false)).toBe(false);
  });

  it("세 조건을 모두 만족하면 확정된다", () => {
    const answer = "손잡이가 그냥 쭉 붙어 있어요";
    expect(evaluateInterpretation(handle, answer, sure)).toEqual({
      status: "ask-user",
      optionId: "attached",
    });
    expect(isConfirmed(handle, answer, sure, true)).toBe(true);
  });

  it("AI 응답 실패는 미확정이다", () => {
    expect(evaluateInterpretation(handle, "붙어 있어요", null)).toEqual({
      status: "unconfirmed",
      reason: "no-result",
    });
  });
});

describe("AI 응답 파싱", () => {
  it("사전에 없는 id를 버리고 최대 3개만 남긴다", () => {
    const text = JSON.stringify({
      candidates: ["electric-kettle", "toaster", "frying-pan", "chair", "battery"],
    });
    expect(parseCandidates(text)).toEqual(["electric-kettle", "frying-pan", "chair"]);
  });

  it("JSON이 아니면 후보 0개다", () => {
    expect(parseCandidates("전기포트입니다")).toEqual([]);
    expect(parseCandidates(null)).toEqual([]);
  });

  it("해석 응답 형식이 틀리면 null이다", () => {
    expect(parseInterpretation("not json")).toBeNull();
    expect(parseInterpretation('{"optionId":1,"certainty":"확실"}')).toBeNull();
    expect(parseInterpretation('{"optionId":"a","certainty":"아마"}')).toBeNull();
    expect(parseInterpretation('{"optionId":null,"certainty":"불확실"}')).toEqual({
      optionId: null,
      certainty: "불확실",
    });
  });
});

describe("저장·불러오기", () => {
  const record: SavedRecord = {
    id: "1",
    itemId: "frying-pan",
    regionCode: MH,
    answers: { handle: "attached", material: "unknown" },
    confirmMethod: { handle: "ai-confirmed", material: "direct" },
    chosenRuleId: "mh-frying-pan-bag",
    savedAt: "2026-11-06T03:00:00.000Z",
  };

  it("저장한 기록을 그대로 다시 읽는다", () => {
    const storage = memoryStorage();
    expect(saveRecord(record, storage)).toBe(true);
    expect(loadRecords(storage)).toEqual([record]);
  });

  it("새 기록이 앞에 온다", () => {
    const storage = memoryStorage();
    saveRecord(record, storage);
    saveRecord({ ...record, id: "2" }, storage);
    expect(loadRecords(storage).map((r) => r.id)).toEqual(["2", "1"]);
  });

  it("쓰기에 실패하면 false를 돌려준다", () => {
    const storage = {
      getItem: () => null,
      setItem: () => {
        throw new Error("quota");
      },
    };
    expect(saveRecord(record, storage)).toBe(false);
  });

  it("쓴 내용이 다시 읽히지 않으면 false를 돌려준다", () => {
    const storage = { getItem: () => null, setItem: () => undefined };
    expect(saveRecord(record, storage)).toBe(false);
  });

  it("지역 설정을 저장하고 잘못된 값은 무시한다", () => {
    const storage = memoryStorage();
    expect(saveSettings({ regionCode: YS }, storage)).toBe(true);
    expect(parseSettings(storage.getItem("settings"))).toEqual({ regionCode: YS });
    expect(parseSettings('{"regionCode":"seoul"}')).toBeNull();
    expect(parseSettings("{broken")).toBeNull();
  });

  it("깨진 기록 데이터는 빈 목록으로 읽는다", () => {
    expect(parseRecords("{broken")).toEqual([]);
  });
});

describe("품목 검색", () => {
  it("별칭으로 찾는다", () => {
    expect(searchItems("커피포트").map((i) => i.id)).toEqual(["electric-kettle"]);
    expect(searchItems("후라이팬").map((i) => i.id)).toEqual(["frying-pan"]);
  });

  it("공백을 무시하고 부분 일치로 찾는다", () => {
    expect(searchItems("전기 주전자").map((i) => i.id)).toContain("electric-kettle");
    expect(searchItems("깨진유리").map((i) => i.id)).toContain("broken-glass");
    expect(searchItems("드라이").map((i) => i.id)).toEqual(["hair-dryer"]);
  });

  it("빈 검색어와 없는 품목은 빈 결과다", () => {
    expect(searchItems("   ")).toEqual([]);
    expect(searchItems("자동차")).toEqual([]);
  });
});

describe("비용 표시", () => {
  it("무료, 금액, 확인 필요를 구분한다", () => {
    expect(formatCost(0)).toBe("무료");
    expect(formatCost(4220)).toBe("4,220원");
    expect(formatCost(null)).toBe("금액 확인 필요");
  });
});
