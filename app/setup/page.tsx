"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { regions } from "@/lib/data";
import { useSettings } from "@/lib/hooks";
import { saveSettings } from "@/lib/storage";
import type { RegionCode } from "@/lib/types";

function SetupForm() {
  const router = useRouter();
  const changing = useSearchParams().get("change") === "1";
  const { ready, settings } = useSettings();
  const [failed, setFailed] = useState(false);
  const skip = ready && settings !== null && !changing;

  useEffect(() => {
    if (skip) router.replace("/");
  }, [skip, router]);

  if (!ready || skip) return null;

  function choose(regionCode: RegionCode) {
    if (saveSettings({ regionCode })) {
      router.push("/");
    } else {
      setFailed(true);
    }
  }

  return (
    <section>
      <p className="text-sm font-semibold text-leaf">
        {changing ? "지역 변경" : "우리동네 분리배출 도우미"}
      </p>
      <h1 className="mt-2 text-2xl leading-snug font-bold">
        어느 구에 살고 계세요?
      </h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">
        분류, 봉투, 요일, 비용은 구마다 달라요. 고른 구의 공식 안내를 기준으로
        알려 드릴게요.
      </p>

      <ul className="mt-6 space-y-3">
        {regions.map((region) => {
          const selected = settings?.regionCode === region.code;
          return (
            <li key={region.code}>
              <button
                type="button"
                onClick={() => choose(region.code)}
                aria-pressed={selected}
                className={`flex min-h-16 w-full items-center justify-between rounded-2xl border-2 bg-card px-5 py-4 text-left text-lg font-bold ${
                  selected ? "border-leaf" : "border-line"
                }`}
              >
                {region.name}
                {selected && (
                  <span className="text-sm font-semibold text-leaf">
                    현재 지역
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {failed && (
        <p role="alert" className="mt-4 rounded-xl bg-danger-soft p-3 text-sm text-danger-ink">
          지역을 저장하지 못했어요. 브라우저의 사이트 데이터 저장이 켜져 있는지
          확인한 뒤 다시 골라 주세요.
        </p>
      )}

      <p className="mt-6 text-sm leading-relaxed text-muted">
        지금은 시범 지역 2곳만 지원해요.
      </p>
    </section>
  );
}

export default function SetupPage() {
  return (
    <Suspense>
      <SetupForm />
    </Suspense>
  );
}
