import { describe, expect, it } from "vitest";
import {
  addStudyDate,
  computeStreak,
  toDateKey,
} from "@/domain/progress/streak";
import { bonusXpForAttempt, xpForCorrectAnswer } from "@/domain/quiz/xp";

describe("xpForCorrectAnswer", () => {
  it("通常のクイズ正解は10XP", () => {
    expect(xpForCorrectAnswer("lesson")).toBe(10);
  });

  it("復習の正解は5XP", () => {
    expect(xpForCorrectAnswer("review")).toBe(5);
  });
});

describe("bonusXpForAttempt", () => {
  it("初回クリアで50XP", () => {
    expect(
      bonusXpForAttempt({
        isFirstClear: true,
        isPerfectFirstTry: false,
        chapterJustCompleted: false,
      }),
    ).toBe(50);
  });

  it("初回クリア + 全問初回正解 + 章完了で170XP", () => {
    expect(
      bonusXpForAttempt({
        isFirstClear: true,
        isPerfectFirstTry: true,
        chapterJustCompleted: true,
      }),
    ).toBe(170);
  });

  it("何もなければ0XP", () => {
    expect(
      bonusXpForAttempt({
        isFirstClear: false,
        isPerfectFirstTry: false,
        chapterJustCompleted: false,
      }),
    ).toBe(0);
  });
});

describe("addStudyDate", () => {
  it("重複せず昇順で追加される", () => {
    expect(addStudyDate(["2026-01-02"], "2026-01-01")).toEqual([
      "2026-01-01",
      "2026-01-02",
    ]);
    expect(addStudyDate(["2026-01-01"], "2026-01-01")).toEqual(["2026-01-01"]);
  });
});

describe("computeStreak", () => {
  const today = new Date(2026, 0, 10); // 2026-01-10

  it("学習履歴がなければ0", () => {
    expect(computeStreak([], today)).toBe(0);
  });

  it("今日を含む連続日数を数える", () => {
    expect(
      computeStreak(["2026-01-08", "2026-01-09", "2026-01-10"], today),
    ).toBe(3);
  });

  it("今日未学習でも昨日までの連続は維持される", () => {
    expect(computeStreak(["2026-01-08", "2026-01-09"], today)).toBe(2);
  });

  it("間が空くと連続は途切れる", () => {
    expect(computeStreak(["2026-01-05", "2026-01-10"], today)).toBe(1);
  });

  it("toDateKey はローカル日付をYYYY-MM-DDにする", () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});
