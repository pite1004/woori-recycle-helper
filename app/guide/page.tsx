"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { Suspense } from "react";
import GuideView from "@/components/GuideView";
import { getItem, getRegion } from "@/lib/data";
import { parseJsonParam } from "@/lib/flow";
import { useRecords, useSettings } from "@/lib/hooks";
import type { ConfirmMethod } from "@/lib/types";

function Notice({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl bg-card p-4">
      <h1 className="text-lg font-bold">{title}</h1>
      <p className="mt-2 text-[15px] leading-relaxed">{children}</p>
    </section>
  );
}

function SavedGuide({ recordId }: { recordId: string }) {
  const { ready, records } = useRecords();
  if (!ready) return null;

  const record = records.find((r) => r.id === recordId);
  if (!record) {
    return (
      <Notice title="기록을 찾지 못했어요">
        <Link href="/records" className="font-bold text-leaf underline">
          내 기록으로 돌아가기
        </Link>
      </Notice>
    );
  }

  const item = getItem(record.itemId);
  const region = getRegion(record.regionCode);
  if (!item || !region) {
    return (
      <Notice title="이 기록의 데이터가 사라졌어요">
        저장한 품목이나 지역이 지금 데이터에 없어서 안내를 열 수 없어요. 새로
        찾아 주세요.
      </Notice>
    );
  }

  return (
    <GuideView
      item={item}
      region={region}
      answers={record.answers}
      confirmMethod={record.confirmMethod}
      record={record}
    />
  );
}

function NewGuide() {
  const params = useSearchParams();
  const { ready, settings } = useSettings();
  if (!ready || !settings) return null;

  const item = getItem(params.get("item") ?? "");
  const region = getRegion(settings.regionCode);
  if (!item || !region) {
    return (
      <Notice title="품목을 찾지 못했어요">
        <Link href="/identify" className="font-bold text-leaf underline">
          품목 다시 고르기
        </Link>
      </Notice>
    );
  }

  return (
    <GuideView
      key={`${item.id}-${region.code}-${params.get("a") ?? ""}`}
      item={item}
      region={region}
      answers={parseJsonParam<Record<string, string>>(params.get("a"))}
      confirmMethod={parseJsonParam<Record<string, ConfirmMethod>>(params.get("c"))}
    />
  );
}

function GuideRouter() {
  const recordId = useSearchParams().get("record");
  return recordId ? <SavedGuide recordId={recordId} /> : <NewGuide />;
}

export default function GuidePage() {
  return (
    <Suspense>
      <GuideRouter />
    </Suspense>
  );
}
