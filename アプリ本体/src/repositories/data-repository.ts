import { createSeedData, DATA_VERSION } from "@/data/seed";
import type { AppData } from "@/types";

/**
 * データ保存の抽象化。
 * 現在はダミーデータ + localStorage。Supabase 接続時はこのインターフェースの実装を差し替える。
 */
export interface DataRepository {
  load(): AppData;
  save(data: AppData): void;
  reset(): AppData;
}

const STORAGE_KEY = "app-main:data";

function isAppData(v: unknown): v is AppData {
  if (!v || typeof v !== "object") return false;
  const d = v as Record<string, unknown>;
  return (
    d.version === DATA_VERSION &&
    ["customers", "employees", "projects", "sales", "targets"].every((k) => Array.isArray(d[k]))
  );
}

export const localStorageRepository: DataRepository = {
  load() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (isAppData(parsed)) return parsed;
      }
    } catch {
      // 破損時は初期データへフォールバック
    }
    return createSeedData();
  },
  save(data) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // 保存できない環境(プライベートモード等)ではメモリ上のみで動作
    }
  },
  reset() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {}
    return createSeedData();
  },
};
