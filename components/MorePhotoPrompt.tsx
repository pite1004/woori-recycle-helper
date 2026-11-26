"use client";

import type { ChangeEvent } from "react";
import { getItem } from "@/lib/data";
import { MAX_PHOTOS } from "@/lib/images";

/** 미리보기는 메모리 안의 임시 주소로만 만든다. 파일마다 한 번만 만들고 떠날 때 해제한다. */
const previewUrls = new WeakMap<File, string>();

function previewUrl(file: File): string {
  let url = previewUrls.get(file);
  if (!url) {
    url = URL.createObjectURL(file);
    previewUrls.set(file, url);
  }
  return url;
}

export function releasePreviews(files: File[]) {
  for (const file of files) {
    const url = previewUrls.get(file);
    if (url) URL.revokeObjectURL(url);
    previewUrls.delete(file);
  }
}

/** 몇 번째 사진을 찍을 차례인지에 따라 무엇을 찍을지 안내한다 */
const NEXT_SHOT = [
  "",
  "바닥이나 뒷면을 찍어 주세요. 재질 표시나 라벨이 있으면 가까이, 오래돼서 없으면 그대로 찍으면 돼요.",
  "손잡이, 뚜껑, 연결 부위처럼 헷갈리는 부분을 찍어 주세요.",
];

type Props = {
  photos: File[];
  candidates: string[];
  onAdd: (files: File[]) => void;
  onContinue: () => void;
};

export default function MorePhotoPrompt({
  photos,
  candidates,
  onAdd,
  onContinue,
}: Props) {
  const names = candidates
    .map((id) => getItem(id)?.name)
    .filter((name): name is string => Boolean(name));
  const found = names.length > 0;
  const remaining = MAX_PHOTOS - photos.length;

  function add(event: ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? []).slice(0, remaining);
    event.target.value = "";
    if (picked.length > 0) onAdd(picked);
  }

  return (
    <section>
      <h1 className="text-2xl leading-snug font-bold">
        {found ? "AI가 조금 헷갈려요" : "사진으로 품목을 찾지 못했어요"}
      </h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">
        {found
          ? `지금 후보는 ${names.join(", ")}예요.`
          : "사진만으로는 어떤 물건인지 알기 어려워요."}
      </p>
      <p
        role="alert"
        className="mt-3 rounded-xl border-2 border-danger-ink bg-danger-soft px-4 py-3 text-lg leading-snug font-bold text-danger-ink"
      >
        다른 각도에서 한 장 더 찍어 주세요
        <span className="mt-0.5 block text-sm font-semibold">
          {found
            ? "한 장 더 있으면 AI가 더 정확하게 골라요."
            : "어렵다면 아래 [직접 고르기]를 눌러 주세요."}
        </span>
      </p>

      <div className="mt-4 flex gap-2">
        {photos.map((photo, index) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={index}
            src={previewUrl(photo)}
            alt={`찍은 사진 ${index + 1}`}
            className="size-16 rounded-xl object-cover"
          />
        ))}
      </div>

      <div className="mt-4 rounded-2xl border-2 border-leaf bg-card p-4">
        <p className="text-sm font-bold text-leaf">
          {photos.length + 1}번째 사진
        </p>
        <p className="mt-1 text-[15px] leading-relaxed">
          {NEXT_SHOT[photos.length]}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <label
            role="button"
            className="flex min-h-12 cursor-pointer items-center justify-center rounded-xl bg-leaf px-2 text-center font-bold text-white focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-leaf"
          >
            한 장 더 찍기
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={add}
              data-testid="more-camera-input"
              className="sr-only"
            />
          </label>
          <label
            role="button"
            className="flex min-h-12 cursor-pointer items-center justify-center rounded-xl border-2 border-line px-2 text-center font-bold focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-leaf"
          >
            앨범에서 추가
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={add}
              data-testid="more-album-input"
              className="sr-only"
            />
          </label>
        </div>
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="mt-4 h-12 w-full rounded-xl border-2 border-line bg-card font-bold"
      >
        {found ? "지금 후보로 계속" : "직접 고르기"}
      </button>
    </section>
  );
}
