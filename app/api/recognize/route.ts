import { NextResponse } from "next/server";
import { recognizeItem } from "@/lib/ai";
import { checkImages } from "@/lib/images";

export const maxDuration = 40;

export async function POST(request: Request) {
  let images: unknown;
  try {
    ({ images } = (await request.json()) as { images?: unknown });
  } catch {
    return NextResponse.json({ candidates: [] }, { status: 400 });
  }

  const check = checkImages(images);
  if (!check.ok) {
    return NextResponse.json({ candidates: [] }, { status: check.status });
  }

  try {
    return NextResponse.json(await recognizeItem(check.images));
  } catch (error) {
    // 사진 내용이 로그에 남지 않도록 오류 종류만 기록한다
    console.error("recognize failed:", (error as Error).name);
    return NextResponse.json({ candidates: [] }, { status: 502 });
  }
}
