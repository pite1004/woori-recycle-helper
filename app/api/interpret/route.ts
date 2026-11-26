import { NextResponse } from "next/server";
import { interpretAnswer } from "@/lib/ai";
import { getItem } from "@/lib/data";

export const maxDuration = 40;

const MAX_ANSWER_LENGTH = 200;

type Body = { itemId?: unknown; questionId?: unknown; answer?: unknown };

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ result: null }, { status: 400 });
  }

  const { itemId, questionId, answer } = body;
  if (typeof answer !== "string" || answer.trim().length === 0) {
    return NextResponse.json({ result: null }, { status: 400 });
  }
  if (answer.length > MAX_ANSWER_LENGTH) {
    return NextResponse.json({ result: null }, { status: 413 });
  }

  // 질문과 선택지는 클라이언트가 보낸 값이 아니라 서버의 품목 사전에서 찾는다
  const question =
    typeof itemId === "string"
      ? getItem(itemId)?.questions.find((q) => q.id === questionId)
      : undefined;
  if (!question) {
    return NextResponse.json({ result: null }, { status: 400 });
  }

  try {
    const result = await interpretAnswer(question, answer);
    return NextResponse.json({ result });
  } catch (error) {
    console.error("interpret failed:", (error as Error).name);
    return NextResponse.json({ result: null }, { status: 502 });
  }
}
