export type RegionCode = "incheon-michuhol" | "incheon-yeonsu";

export type Settings = { regionCode: RegionCode };

export type Region = {
  code: RegionCode;
  name: string;
  contactName: string;
  contactPhone: string;
  contactUrl: string;
};

export type QuestionOption = { id: string; label: string };

export type Question = {
  id: string;
  /** "손잡이: 분리 안 됨으로 이해했어요"처럼 해석 확인 문구에 쓰는 짧은 이름 */
  shortLabel: string;
  text: string;
  options: QuestionOption[];
};

export type Item = {
  id: string;
  name: string;
  aliases: string[];
  group: string;
  questions: Question[];
};

export type DisposalRule = {
  id: string;
  regionCode: RegionCode;
  itemId: string;
  /** 상태 조건. {} = 어느 상태여도 적용(= '모름 기본 방법' 후보) */
  when: Record<string, string>;
  /** false인 규칙은 화면에 절대 표시하지 않는다 */
  allowed: boolean;
  method: string;
  category: string;
  bagOrSticker: string;
  days: string;
  time: string;
  place: string;
  /** 0 = 무료, null = 금액 확인 필요 */
  costWon: number | null;
  costNote?: string;
  cautions: string[];
  sourceTitle: string;
  sourceUrl: string;
  checkedAt: string;
};

export type ConfirmMethod = "direct" | "ai-confirmed";

export type SavedRecord = {
  id: string;
  itemId: string;
  regionCode: RegionCode;
  /** 질문별 확정 선택지 id ("unknown" 포함) */
  answers: Record<string, string>;
  confirmMethod: Record<string, ConfirmMethod>;
  chosenRuleId: string | null;
  savedAt: string;
};

export type Certainty = "확실" | "불확실";

export type AiInterpretation = {
  optionId: string | null;
  certainty: Certainty;
};

export const UNKNOWN_OPTION: QuestionOption = {
  id: "unknown",
  label: "모르겠음",
};
