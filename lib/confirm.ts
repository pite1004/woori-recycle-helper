import type { AiInterpretation, Question } from "./types";

const UNCERTAIN_WORDS = ["모르", "같아", "같은데", "아마", "글쎄", "애매", "듯"];

/** 앱 쪽 이중 안전장치: AI 결과와 무관하게 불확실로 처리할 표현 */
export function hasUncertainExpression(answer: string): boolean {
  return UNCERTAIN_WORDS.some((word) => answer.includes(word));
}

export type InterpretDecision =
  /** 조건 1·2 통과: 사용자에게 [맞아요]를 받아야 확정된다(조건 3) */
  | { status: "ask-user"; optionId: string }
  /** 미확정: 선택지 버튼만 보여 주며 다시 묻는다 */
  | { status: "unconfirmed"; reason: UnconfirmedReason };

export type UnconfirmedReason =
  | "no-result"
  | "no-single-option"
  | "uncertain-ai"
  | "uncertain-words";

/**
 * 확정 조건 1(선택지 하나에 대응)과 2(불확실 표시 없음)를 판단한다.
 * AI 응답 실패·파싱 실패·시간 초과는 result가 null로 들어와 미확정이 된다.
 */
export function evaluateInterpretation(
  question: Question,
  answer: string,
  result: AiInterpretation | null,
): InterpretDecision {
  if (hasUncertainExpression(answer)) {
    return { status: "unconfirmed", reason: "uncertain-words" };
  }
  if (result === null) return { status: "unconfirmed", reason: "no-result" };

  const matched = question.options.filter(
    (option) => option.id === result.optionId,
  );
  if (matched.length !== 1) {
    return { status: "unconfirmed", reason: "no-single-option" };
  }
  if (result.certainty !== "확실") {
    return { status: "unconfirmed", reason: "uncertain-ai" };
  }
  return { status: "ask-user", optionId: matched[0].id };
}

/** 확정 조건 3까지 포함한 최종 판단: 세 조건을 모두 만족해야 true */
export function isConfirmed(
  question: Question,
  answer: string,
  result: AiInterpretation | null,
  userAccepted: boolean,
): boolean {
  const decision = evaluateInterpretation(question, answer, result);
  return decision.status === "ask-user" && userAccepted;
}
