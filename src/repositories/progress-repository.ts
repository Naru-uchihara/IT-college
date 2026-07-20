import type { LocalProgress } from "@/types";

/**
 * 進捗データの保存先を抽象化するRepositoryインタフェース。
 * Phase 1 は localStorage 実装、Phase 2 で Supabase 実装へ差し替える。
 */
export interface ProgressRepository {
  load(): LocalProgress;
  save(progress: LocalProgress): void;
  reset(): void;
}

export const PROGRESS_SCHEMA_VERSION = 1;

/** 進捗の初期値 */
export function createEmptyProgress(): LocalProgress {
  return {
    version: PROGRESS_SCHEMA_VERSION,
    lessonProgress: {},
    questionProgress: {},
    attempts: [],
    xp: 0,
    studyDates: [],
  };
}
