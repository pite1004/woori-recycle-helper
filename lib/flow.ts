import type { ConfirmMethod, Question } from "./types";
import { UNKNOWN_OPTION } from "./types";

export function answerLabel(question: Question, optionId?: string): string {
  if (optionId === UNKNOWN_OPTION.id) return UNKNOWN_OPTION.label;
  return (
    question.options.find((option) => option.id === optionId)?.label ??
    "답변 없음"
  );
}

/** 끝 글자 받침에 맞춰 "으로"/"로"를 붙인다 (받침 없음·ㄹ받침은 "로") */
export function withEuro(word: string): string {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  if (code < 0 || code > 11171) return `${word}(으)로`;
  const jongseong = code % 28;
  return `${word}${jongseong === 0 || jongseong === 8 ? "로" : "으로"}`;
}

/** 새로고침해도 안내가 유지되도록 흐름 상태는 주소에 담는다 */
export function guideHref(
  itemId: string,
  answers: Record<string, string> = {},
  methods: Record<string, ConfirmMethod> = {},
): string {
  const params = new URLSearchParams({ item: itemId });
  if (Object.keys(answers).length > 0) {
    params.set("a", JSON.stringify(answers));
    params.set("c", JSON.stringify(methods));
  }
  return `/guide?${params.toString()}`;
}

export function parseJsonParam<T extends object>(
  value: string | null,
): T | Record<string, never> {
  if (!value) return {};
  try {
    const parsed: unknown = JSON.parse(value);
    return parsed && typeof parsed === "object" ? (parsed as T) : {};
  } catch {
    return {};
  }
}
