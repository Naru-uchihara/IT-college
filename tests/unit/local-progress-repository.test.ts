import { describe, expect, it } from "vitest";
import {
  LocalProgressRepository,
  STORAGE_KEY,
} from "@/repositories/local-progress-repository";
import {
  PROGRESS_SCHEMA_VERSION,
  createEmptyProgress,
} from "@/repositories/progress-repository";

function createMemoryStorage(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
    removeItem: (key: string) => {
      map.delete(key);
    },
  };
}

describe("LocalProgressRepository", () => {
  it("データがなければ初期値を返す", () => {
    const repo = new LocalProgressRepository(createMemoryStorage());
    expect(repo.load()).toEqual(createEmptyProgress());
  });

  it("保存したデータを読み戻せる", () => {
    const repo = new LocalProgressRepository(createMemoryStorage());
    const progress = createEmptyProgress();
    progress.xp = 120;
    progress.studyDates = ["2026-01-01"];
    repo.save(progress);
    expect(repo.load()).toEqual(progress);
  });

  it("壊れたJSONでもクラッシュせず初期値へフォールバックする", () => {
    const repo = new LocalProgressRepository(
      createMemoryStorage({ [STORAGE_KEY]: "{broken json" }),
    );
    expect(repo.load()).toEqual(createEmptyProgress());
  });

  it("スキーマに合わないデータは初期値へフォールバックする", () => {
    const repo = new LocalProgressRepository(
      createMemoryStorage({
        [STORAGE_KEY]: JSON.stringify({ xp: "百二十" }),
      }),
    );
    expect(repo.load()).toEqual(createEmptyProgress());
  });

  it("未知のバージョンは初期値へフォールバックする", () => {
    const progress = createEmptyProgress();
    const repo = new LocalProgressRepository(
      createMemoryStorage({
        [STORAGE_KEY]: JSON.stringify({
          ...progress,
          version: PROGRESS_SCHEMA_VERSION + 999,
        }),
      }),
    );
    expect(repo.load()).toEqual(createEmptyProgress());
  });

  it("resetでデータが消える", () => {
    const storage = createMemoryStorage();
    const repo = new LocalProgressRepository(storage);
    const progress = createEmptyProgress();
    progress.xp = 10;
    repo.save(progress);
    repo.reset();
    expect(storage.getItem(STORAGE_KEY)).toBeNull();
    expect(repo.load()).toEqual(createEmptyProgress());
  });
});
