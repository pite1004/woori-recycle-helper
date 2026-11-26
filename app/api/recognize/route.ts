import { NextResponse } from "next/server";
import { recognizeItem } from "@/lib/ai";

export const maxDuration = 40;

/** 원본 2MB를 base64로 바꾼 길이 */
const MAX_BASE64_LENGTH = Math.ceil((2 * 1024 * 1024 * 4) / 3);

export async function POST(request: Request) {
  let image: unknown;
  try {
    ({ image } = (await request.json()) as { image?: unknown });
  } catch {
    return NextResponse.json({ candidates: [] }, { status: 400 });
  }

  if (typeof image !== "string" || image.length === 0) {
    return NextResponse.json({ candidates: [] }, { status: 400 });
  }
  if (image.length > MAX_BASE64_LENGTH) {
    return NextResponse.json({ candidates: [] }, { status: 413 });
  }

  try {
    const candidates = await recognizeItem(image);
    return NextResponse.json({ candidates });
  } catch (error) {
    // 사진 내용이 로그에 남지 않도록 오류 종류만 기록한다
    console.error("recognize failed:", (error as Error).name);
    return NextResponse.json({ candidates: [] }, { status: 502 });
  }
}
