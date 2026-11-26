import { items as allItems } from "./data";
import type { Item } from "./types";

function normalize(text: string): string {
  return text.replace(/\s+/g, "").toLowerCase();
}

/** 이름·별칭 부분 일치(공백 무시) */
export function searchItems(query: string, source: Item[] = allItems): Item[] {
  const needle = normalize(query);
  if (!needle) return [];
  return source.filter((item) =>
    [item.name, ...item.aliases].some((word) =>
      normalize(word).includes(needle),
    ),
  );
}
