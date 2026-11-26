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

const PAGE = 40;

/** 한 분류의 품목. 수백 개인 분류도 있어 40개씩 더 보여 준다. */
function GroupItems({
  group,
  onPick,
}: {
  group: string;
  onPick: (itemId: string) => void;
}) {
  const [shown, setShown] = useState(PAGE);
  const inGroup = items
    .filter((item) => item.group === group)
    .sort((a, b) => a.name.localeCompare(b.name, "ko"));
  return (
    <div className="mt-3 rounded-2xl bg-desk/60 p-3">
      <div className="flex flex-wrap gap-2">
        {inGroup.slice(0, shown).map((item) => (
          <ItemChip key={item.id} item={item} onPick={onPick} />
        ))}
      </div>
      {inGroup.length > shown && (
        <button
          type="button"
          onClick={() => setShown((n) => n + PAGE)}
          className="mt-3 h-11 w-full rounded-xl border-2 border-line bg-card text-sm font-bold"
        >
          더 보기 ({inGroup.length - shown}개 남음)
        </button>
      )}
    </div>
  );
}

/** 분류군 버튼과 그 분류의 품목. 검색 전에도, 결과가 없을 때도 쓴다. */
function GroupBrowser({
  group,
  onGroup,
  onPick,
}: {
  group: string | null;
  onGroup: (group: string | null) => void;
  onPick: (itemId: string) => void;
}) {
  return (
    <>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {getGroups().map((name) => {
          const count = items.filter((item) => item.group === name).length;
          const selected = group === name;
          return (
            <button
              key={name}
              type="button"
              onClick={() => onGroup(selected ? null : name)}
              aria-pressed={selected}
              className={`flex min-h-12 items-center justify-between rounded-xl border-2 px-3 py-2 text-left text-[15px] font-bold ${
                selected
                  ? "border-leaf bg-leaf-soft text-leaf-dark"
                  : "border-line bg-card"
              }`}
            >
              {name}
              <span className="text-xs font-semibold text-muted">{count}</span>
            </button>
          );
        })}
      </div>
      {group && <GroupItems group={group} onPick={onPick} />}
    </>
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
  const results = searchItems(searched);
  const frequent = FREQUENT_ITEM_IDS.map(getItem).filter(
    (item): item is Item => item !== undefined,
  );
  const noResult = searched !== "" && results.length === 0;

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
            placeholder="예: 커피포트, 노트북"
            autoComplete="off"
            aria-invalid={noResult}
            className={`h-12 min-w-0 flex-1 rounded-xl border-2 bg-card px-4 text-base focus:outline-none ${
              noResult
                ? "border-danger-ink"
                : "border-line focus:border-leaf"
            }`}
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

      {searched !== "" && results.length > 0 && (
        <>
          <p role="status" className="mt-4 text-base font-bold text-leaf-dark">
            ‘{searched}’ 검색 결과 {results.length}개
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {results.map((item) => (
              <ItemChip key={item.id} item={item} onPick={onPick} />
            ))}
          </div>
        </>
      )}

      {noResult && (
        <div
          role="alert"
          className="mt-4 rounded-2xl border-2 border-danger-ink bg-danger-soft p-4"
        >
          <p className="text-lg leading-snug font-bold text-danger-ink">
            ‘{searched}’ 검색 결과가 없어요
          </p>
          <p className="mt-1 text-[15px] leading-relaxed text-danger-ink">
            다른 이름으로 검색하거나, 아래에서 비슷한 분류를 골라 주세요.
          </p>
        </div>
      )}

      {searched === "" && (
        <div className="mt-5">
          <p className="text-sm font-bold">자주 찾는 품목</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {frequent.map((item) => (
              <ItemChip key={item.id} item={item} onPick={onPick} />
            ))}
          </div>
        </div>
      )}

      {(searched === "" || noResult) && (
        <div className="mt-6">
          <p className="text-sm font-bold">
            분류별로 찾기{" "}
            <span className="font-semibold text-muted">
              · 전체 {items.length}개 품목
            </span>
          </p>
          <GroupBrowser group={group} onGroup={setGroup} onPick={onPick} />
        </div>
      )}
    </div>
  );
}
