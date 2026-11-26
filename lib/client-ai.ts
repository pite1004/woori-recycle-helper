"use client";

import type { AiInterpretation } from "./types";

const TIMEOUT_MS = 30_000;
const MAX_SIDE = 1024;

/** 메모리에만 두는 사진 인식 결과. 사진 자체는 어디에도 보관하지 않는다. */
export type Recognition = { candidates: string[]; failed: boolean };

let recognition: Recognition | null = null;

export function getRecognition(): Recognition | null {
  return recognition;
}

export function clearRecognition() {
  recognition = null;
}

/** 긴 변 1024px 이하 JPEG(base64, 접두사 없음)로 줄인다 */
async function toResizedJpeg(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("canvas unavailable");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.82).split(",")[1];
}

/** 어떤 실패든 failed: true로 돌려주어 직접 고르기 화면으로 이어진다 */
export async function recognizePhotos(files: File[]): Promise<Recognition> {
  try {
    const images = await Promise.all(files.map(toResizedJpeg));
    const response = await fetch("/api/recognize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ images }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) throw new Error(`status ${response.status}`);
    const { candidates } = (await response.json()) as { candidates: string[] };
    recognition = { candidates, failed: candidates.length === 0 };
  } catch {
    recognition = { candidates: [], failed: true };
  }
  return recognition;
}

/** 네트워크 오류·타임아웃·파싱 실패는 모두 null(= 미확정 경로) */
export async function requestInterpretation(
  itemId: string,
  questionId: string,
  answer: string,
): Promise<AiInterpretation | null> {
  try {
    const response = await fetch("/api/interpret", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, questionId, answer }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) return null;
    const { result } = (await response.json()) as {
      result: AiInterpretation | null;
    };
    return result;
  } catch {
    return null;
  }
}
