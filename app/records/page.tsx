"use client";

import Link from "next/link";
import { getItem, getRegion } from "@/lib/data";
import { useRecords } from "@/lib/hooks";

export default function RecordsPage() {
  const { ready, records } = useRecords();
  if (!ready) return null;

  return (
    <section>
      <h1 className="text-2xl leading-snug font-bold">내 기록</h1>

      {records.length === 0 ? (
        <div className="mt-5 rounded-2xl bg-card p-5 text-center">
          <p className="text-[15px] leading-relaxed text-muted">
            아직 저장한 안내가 없어요.
            <br />
            안내 화면에서 저장하면 여기에서 다시 열 수 있어요.
          </p>
          <Link
            href="/"
            className="mt-4 flex h-12 items-center justify-center rounded-xl bg-leaf font-bold text-white"
          >
            버릴 물건 찾기
          </Link>
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {records.map((record) => (
            <li key={record.id}>
              <Link
                href={`/guide?record=${encodeURIComponent(record.id)}`}
                className="block rounded-xl border border-line bg-card px-4 py-3"
              >
                <span className="block text-[17px] font-bold">
                  {getItem(record.itemId)?.name ?? "사라진 품목"}
                </span>
                <span className="mt-0.5 block text-sm text-muted">
                  {getRegion(record.regionCode)?.name ?? "사라진 지역"} ·{" "}
                  {new Date(record.savedAt).toLocaleString("ko-KR")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-5 text-sm leading-relaxed text-muted">
        기록은 이 기기의 브라우저에만 저장돼요.
      </p>
    </section>
  );
}
