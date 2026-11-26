"use client";

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
  const [group, setGroup] = useState<string | null>(null);
  const trimmed = query.trim();
  const results = searchItems(trimmed);
  const frequent = FREQUENT_ITEM_IDS.map(getItem).filter(
    (item): item is Item => item !== undefined,
  );

  return (
    <div>
      <label className="block text-sm font-bold" htmlFor="item-search">
        품목 검색
      </label>
      <input
        id="item-search"
        type="search"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setGroup(null);
        }}
        placeholder="예: 커피포트, 후라이팬"
        autoComplete="off"
        className="mt-2 h-12 w-full rounded-xl border-2 border-line bg-card px-4 text-base focus:border-leaf focus:outline-none"
      />

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
        <div className="mt-4 flex flex-wrap gap-2">
          {results.map((item) => (
            <ItemChip key={item.id} item={item} onPick={onPick} />
          ))}
        </div>
      )}

      {trimmed !== "" && results.length === 0 && (
        <div className="mt-4">
          <p className="text-[15px] leading-relaxed">
            ‘{trimmed}’ 품목을 찾지 못했어요. 비슷한 분류를 골라 주세요.
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
