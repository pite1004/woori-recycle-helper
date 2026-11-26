"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ChangeEvent } from "react";
import { useState } from "react";
import HomeExtras from "@/components/HomeExtras";
import MorePhotoPrompt, { releasePreviews } from "@/components/MorePhotoPrompt";
import type { Recognition } from "@/lib/client-ai";
import { clearRecognition, recognizePhotos } from "@/lib/client-ai";
import { getRegion } from "@/lib/data";
import { useSettings } from "@/lib/hooks";
import { MAX_PHOTOS } from "@/lib/images";

export default function HomePage() {
  const router = useRouter();
  const { settings } = useSettings();
  const [photos, setPhotos] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  /** AI가 헷갈렸을 때의 결과. 있으면 한 장 더 찍기를 권하는 화면을 보여 준다. */
  const [unsure, setUnsure] = useState<Recognition | null>(null);
  const region = settings ? getRegion(settings.regionCode) : undefined;

  function finish(all: File[]) {
    releasePreviews(all);
    router.push("/identify");
  }

  async function recognize(all: File[]) {
    setPhotos(all);
    setUnsure(null);
    setBusy(true);
    const result = await recognizePhotos(all);
    if (result.uncertain && all.length < MAX_PHOTOS) {
      setUnsure(result);
      setBusy(false);
      return;
    }
    finish(all);
  }

  function pick(event: ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? []).slice(0, MAX_PHOTOS);
    event.target.value = "";
    if (picked.length > 0) void recognize(picked);
  }

  if (!region) return null;

  if (busy) {
    return (
      <section
        role="status"
        className="flex min-h-[60dvh] flex-col items-center justify-center text-center"
      >
        <div className="size-12 animate-spin rounded-full border-4 border-leaf-soft border-t-leaf" />
        <p className="mt-5 text-lg font-bold">
          {photos.length > 1
            ? `사진 ${photos.length}장을 살펴보고 있어요`
            : "사진을 살펴보고 있어요"}
        </p>
        <p className="mt-1 text-sm text-muted">
          최대 30초 걸릴 수 있어요. 사진은 저장하지 않아요.
        </p>
      </section>
    );
  }

  if (unsure) {
    return (
      <MorePhotoPrompt
        photos={photos}
        candidates={unsure.candidates}
        onAdd={(more) => void recognize([...photos, ...more])}
        onContinue={() => finish(photos)}
      />
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-leaf">
          우리동네 분리배출 도우미
        </p>
        <Link
          href="/setup?change=1"
          className="shrink-0 rounded-full bg-leaf-soft px-3 py-1.5 text-sm font-bold text-leaf-dark"
        >
          {region.name}
        </Link>
      </div>

      <h1 className="mt-6 text-[28px] leading-tight font-bold">
        버릴 물건을
        <br />
        찍어 주세요
      </h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">
        {region.name} 기준으로 배출 방법과 비용을 비교해 드려요.
      </p>

      <div className="mt-7 space-y-3">
        <label
          role="button"
          className="flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-3xl bg-leaf px-4 text-center text-white focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-leaf active:bg-leaf-dark"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="size-10"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9 4 7.5 6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3.5L15 4zm3 13a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9zm0-2a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"
            />
          </svg>
          <span className="text-xl font-bold">사진 찍기</span>
          <span className="text-sm text-white/85">
            물건 하나만, 전체가 보이게 밝은 곳에서 찍어 주세요
          </span>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={pick}
            data-testid="camera-input"
            className="sr-only"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label
            role="button"
            className="flex min-h-16 cursor-pointer items-center justify-center rounded-2xl border-2 border-line bg-card px-2 text-center text-base font-bold focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-leaf"
          >
            앨범에서 고르기
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={pick}
              data-testid="album-input"
              className="sr-only"
            />
          </label>
          <Link
            href="/identify"
            onClick={clearRecognition}
            className="flex min-h-16 items-center justify-center rounded-2xl border-2 border-line bg-card px-2 text-center text-base font-bold"
          >
            품목 직접 검색
          </Link>
        </div>
        <p className="text-center text-sm text-muted">
          AI가 헷갈리면 한 장 더 찍어 달라고 할게요.
        </p>
      </div>

      <HomeExtras />
    </section>
  );
}
