"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { FREQUENT_ITEM_IDS, getGroups, getItem, items } from "@/lib/data";
import { searchItems } from "@/lib/search";
import type { Item } from "@/lib/types";

function ItemChip({
  item,
  onPick,
}: {
  item: Item;
  onPick: (itemId: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onPick(item.id)}
      className="min-h-11 rounded-full border border-line bg-card px-4 py-2 text-[15px] font-semibold"
    >
      {item.name}
    </button>
  );
}

export default function ItemPicker({
  onPick,
}: {
  onPick: (itemId: string) => void;
}) {
  const [query, setQuery] = useState("");
  /** [검색]을 누른 검색어. 결과는 이 값으로만 보여 줘서 검색이 됐는지 알 수 있게 한다. */
  const [searched, setSearched] = useState("");
  const [group, setGroup] = useState<string | null>(null);
  const trimmed = searched;
  const results = searchItems(trimmed);
  const frequent = FREQUENT_ITEM_IDS.map(getItem).filter(
    (item): item is Item => item !== undefined,
  );

  function submit(event: FormEvent) {
    event.preventDefault();
    setSearched(query.trim());
    setGroup(null);
  }

  return (
    <div>
      <form role="search" onSubmit={submit}>
        <label className="block text-sm font-bold" htmlFor="item-search">
          품목 검색
        </label>
        <div className="mt-2 flex gap-2">
          <input
            id="item-search"
            type="search"
            enterKeyHint="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              if (event.target.value.trim() === "") {
                setSearched("");
                setGroup(null);
              }
            }}
            placeholder="예: 커피포트, 후라이팬"
            autoComplete="off"
            className="h-12 min-w-0 flex-1 rounded-xl border-2 border-line bg-card px-4 text-base focus:border-leaf focus:outline-none"
          />
          <button
            type="submit"
            disabled={query.trim() === ""}
            className="h-12 shrink-0 rounded-xl bg-leaf px-4 text-base font-bold text-white disabled:bg-line disabled:text-muted"
          >
            검색
          </button>
        </div>
      </form>

      {trimmed !== "" && (
        <p role="status" className="mt-4 text-sm font-bold text-muted">
          ‘{trimmed}’ 검색 결과 {results.length}개
        </p>
      )}

      {trimmed === "" && (
        <div className="mt-5">
          <p className="text-sm font-bold">자주 찾는 품목</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {frequent.map((item) => (
              <ItemChip key={item.id} item={item} onPick={onPick} />
            ))}
          </div>
        </div>
      )}

      {trimmed !== "" && results.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {results.map((item) => (
            <ItemChip key={item.id} item={item} onPick={onPick} />
          ))}
        </div>
      )}

      {trimmed !== "" && results.length === 0 && (
        <div className="mt-2">
          <p className="text-[15px] leading-relaxed">
            맞는 품목이 없어요. 비슷한 분류를 골라 주세요.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {getGroups().map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setGroup(name)}
                aria-pressed={group === name}
                className={`min-h-11 rounded-xl border px-3 py-2 text-sm font-bold ${
                  group === name
                    ? "border-leaf bg-leaf-soft text-leaf-dark"
                    : "border-line bg-card"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
          {group && (
            <div className="mt-3 flex flex-wrap gap-2">
              {items
                .filter((item) => item.group === group)
                .map((item) => (
                  <ItemChip key={item.id} item={item} onPick={onPick} />
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
