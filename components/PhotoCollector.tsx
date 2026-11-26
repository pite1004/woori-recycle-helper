"use client";

import type { ChangeEvent } from "react";
import { MAX_PHOTOS, MIN_PHOTOS } from "@/lib/images";

/** 미리보기는 메모리 안의 임시 주소로만 만든다. 파일마다 한 번만 만들고 빼거나 떠날 때 해제한다. */
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

const SHOTS = [
  {
    title: "전체 모습",
    hint: "물건 하나만, 전체가 화면에 들어오게 밝은 곳에서 찍어 주세요.",
  },
  {
    title: "재질 표시·라벨",
    hint: "바닥이나 뒷면의 재질 표시, 라벨, 분리배출 마크를 가까이 찍어 주세요.",
  },
  {
    title: "헷갈리는 부분 (선택)",
    hint: "손잡이, 뚜껑, 연결 부위처럼 다른 재질이 붙은 곳을 찍어 주세요.",
  },
];

type Props = {
  photos: File[];
  onChange: (photos: File[]) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

export default function PhotoCollector({
  photos,
  onChange,
  onSubmit,
  onCancel,
}: Props) {
  function addFiles(event: ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (picked.length === 0) return;
    onChange([...photos, ...picked].slice(0, MAX_PHOTOS));
  }

  function remove(index: number) {
    releasePreviews([photos[index]]);
    onChange(photos.filter((_, i) => i !== index));
  }

  function cancel() {
    releasePreviews(photos);
    onCancel();
  }

  const ready = photos.length >= MIN_PHOTOS;
  const full = photos.length >= MAX_PHOTOS;

  return (
    <section>
      <h1 className="text-2xl leading-snug font-bold">
        같은 물건을 2~3장 찍어 주세요
      </h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">
        여러 각도에서 찍으면 AI가 재질과 종류를 덜 헷갈려요. 사진은 저장하지
        않아요.
      </p>

      <ol className="mt-5 space-y-3">
        {SHOTS.map((shot, index) => {
          const photo = photos[index];
          const isNext = index === photos.length;
          return (
            <li
              key={shot.title}
              className={`flex items-center gap-3 rounded-2xl border-2 bg-card p-3 ${
                isNext ? "border-leaf" : "border-line"
              }`}
            >
              <div className="flex size-18 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-desk text-xl font-bold text-muted">
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl(photo)}
                    alt={`${index + 1}번째 사진`}
                    className="size-full object-cover"
                  />
                ) : (
                  index + 1
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-bold">{shot.title}</p>
                <p className="mt-0.5 text-sm leading-snug text-muted">
                  {shot.hint}
                </p>
              </div>
              {photo ? (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="shrink-0 rounded-lg px-2 py-2 text-sm font-semibold text-danger-ink underline"
                >
                  빼기
                </button>
              ) : (
                isNext && (
                  <label
                    role="button"
                    className="shrink-0 cursor-pointer rounded-xl bg-leaf px-3 py-2.5 text-sm font-bold text-white focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-leaf"
                  >
                    찍기
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={addFiles}
                      data-testid={`camera-input-${index + 1}`}
                      className="sr-only"
                    />
                  </label>
                )
              )}
            </li>
          );
        })}
      </ol>

      {!full && (
        <label
          role="button"
          className="mt-3 flex min-h-12 cursor-pointer items-center justify-center rounded-xl border-2 border-line bg-card text-[15px] font-bold focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-leaf"
        >
          앨범에서 추가
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={addFiles}
            data-testid="album-add-input"
            className="sr-only"
          />
        </label>
      )}

      <button
        type="button"
        onClick={onSubmit}
        disabled={!ready}
        className="mt-5 h-13 w-full rounded-xl bg-leaf text-base font-bold text-white disabled:bg-line disabled:text-muted"
      >
        {ready
          ? `사진 ${photos.length}장으로 찾기`
          : `${MIN_PHOTOS - photos.length}장 더 찍어 주세요`}
      </button>
      <button
        type="button"
        onClick={cancel}
        className="mt-2 h-11 w-full text-sm font-semibold text-muted underline"
      >
        취소
      </button>
    </section>
  );
}
