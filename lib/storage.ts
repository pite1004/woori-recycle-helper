import { isRegionCode } from "./data";
import type { SavedRecord, Settings } from "./types";

export const SETTINGS_KEY = "settings";
export const RECORDS_KEY = "records";
/** 같은 탭에서 값이 바뀌었음을 구독자에게 알리는 이벤트 이름 */
export const STORE_EVENT = "local-store-change";

type StorageLike = Pick<Storage, "getItem" | "setItem">;

function browserStorage(): StorageLike | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

function notify() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(STORE_EVENT));
  }
}

export function parseSettings(raw: string | null): Settings | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    const code = (value as Settings | null)?.regionCode;
    return isRegionCode(code) ? { regionCode: code } : null;
  } catch {
    return null;
  }
}

export function parseRecords(raw: string | null): SavedRecord[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? (value as SavedRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveSettings(
  settings: Settings,
  storage: StorageLike | null = browserStorage(),
): boolean {
  try {
    if (!storage) return false;
    storage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    notify();
    return parseSettings(storage.getItem(SETTINGS_KEY)) !== null;
  } catch {
    return false;
  }
}

export function loadRecords(
  storage: StorageLike | null = browserStorage(),
): SavedRecord[] {
  try {
    return parseRecords(storage?.getItem(RECORDS_KEY) ?? null);
  } catch {
    return [];
  }
}

/** 쓴 뒤 다시 읽어 같은 내용이 저장됐는지 확인한다 */
export function saveRecord(
  record: SavedRecord,
  storage: StorageLike | null = browserStorage(),
): boolean {
  try {
    if (!storage) return false;
    const others = loadRecords(storage).filter((r) => r.id !== record.id);
    storage.setItem(RECORDS_KEY, JSON.stringify([record, ...others]));
    notify();
    const stored = loadRecords(storage).find((r) => r.id === record.id);
    return JSON.stringify(stored) === JSON.stringify(record);
  } catch {
    return false;
  }
}
