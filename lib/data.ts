import catalogJson from "@/data/catalog.json";
import itemsJson from "@/data/items.json";
import regionsJson from "@/data/regions.json";
import rulesJson from "@/data/rules.json";
import type { CatalogItem } from "./catalog";
import { buildCatalogRules, catalogItems } from "./catalog";
import type { DisposalRule, Item, Region, RegionCode } from "./types";

/** 이 앱이 구청 안내로 직접 정리한 품목과 규칙 */
const curatedItems = itemsJson as Item[];
const curatedRules = rulesJson as DisposalRule[];
/** 「분리의 정석」 품목사전에서 가져온 품목. 규칙은 구청 규칙을 틀로 만든다. */
const catalog = catalogJson as CatalogItem[];

export const items: Item[] = [...curatedItems, ...catalogItems(catalog)];
export const regions = regionsJson as Region[];
export const rules: DisposalRule[] = [
  ...curatedRules,
  ...buildCatalogRules(catalog, curatedRules),
];

const itemById = new Map(items.map((item) => [item.id, item]));

/** 자주 찾는 품목: 사진 인식 실패와 검색 결과 없음 화면에서 보여 준다 */
export const FREQUENT_ITEM_IDS = [
  "electric-kettle",
  "frying-pan",
  "broken-glass",
  "glass-bottle",
  "chair",
  "battery",
];

export function getItem(itemId: string): Item | undefined {
  return itemById.get(itemId);
}

export function getRegion(code: string): Region | undefined {
  return regions.find((region) => region.code === code);
}

export function isRegionCode(code: unknown): code is RegionCode {
  return typeof code === "string" && getRegion(code) !== undefined;
}

export function getGroups(): string[] {
  return [...new Set(items.map((item) => item.group))];
}
