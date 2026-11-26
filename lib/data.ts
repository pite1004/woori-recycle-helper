import itemsJson from "@/data/items.json";
import regionsJson from "@/data/regions.json";
import rulesJson from "@/data/rules.json";
import type { DisposalRule, Item, Region, RegionCode } from "./types";

export const items = itemsJson as Item[];
export const regions = regionsJson as Region[];
export const rules = rulesJson as DisposalRule[];

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
  return items.find((item) => item.id === itemId);
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
