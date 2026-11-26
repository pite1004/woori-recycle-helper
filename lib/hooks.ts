"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  parseRecords,
  parseSettings,
  RECORDS_KEY,
  SETTINGS_KEY,
  STORE_EVENT,
} from "./storage";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(STORE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(STORE_EVENT, onChange);
  };
}

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** undefined = 서버 렌더링 중이라 아직 값을 모르는 상태 */
function useStored(key: string): string | null | undefined {
  return useSyncExternalStore(
    subscribe,
    () => readRaw(key),
    () => undefined,
  );
}

export function useSettings() {
  const raw = useStored(SETTINGS_KEY);
  return useMemo(
    () => ({
      ready: raw !== undefined,
      settings: raw === undefined ? null : parseSettings(raw),
    }),
    [raw],
  );
}

export function useRecords() {
  const raw = useStored(RECORDS_KEY);
  return useMemo(
    () => ({
      ready: raw !== undefined,
      records: raw === undefined ? [] : parseRecords(raw),
    }),
    [raw],
  );
}
