import { describe, expect, it } from "vitest";
import {
  applyCorrectAnswer,
  computeLessonStatus,
  isLessonCleared,
  isLessonMastered,
  isLessonUnlocked,
  remainingRequiredQuestionIds,
} from "@/domain/progress/unlock";
import {
  makeLesson,
  makeLessonProgress,
  makeQuestionProgress,
} from "./helpers";

describe("isLessonCleared", () => {
  it("進捗がなければクリアではない", () => {
    expect(isLessonCleared(undefined)).toBe(false);
  });

  it("必須問題が一部しか正解していなければクリアではない", () => {
    const progress = makeLessonProgress({
      requiredQuestionIds: ["q-1", "q-2"],
      correctlyAnsweredRequiredQuestionIds: ["q-1"],
    });
    expect(isLessonCleared(progress)).toBe(false);
  });

  it("必須問題をすべて一度以上正解していればクリア", () => {
    const progress = makeLessonProgress({
      requiredQuestionIds: ["q-1", "q-2"],
      correctlyAnsweredRequiredQuestionIds: ["q-2", "q-1"],
    });
    expect(isLessonCleared(progress)).toBe(true);
  });

  it("必須問題が空のレッスンはクリア扱いにしない", () => {
    const progress = makeLessonProgress({
      requiredQuestionIds: [],
      correctlyAnsweredRequiredQuestionIds: [],
    });
    expect(isLessonCleared(progress)).toBe(false);
  });
});

describe("isLessonUnlocked", () => {
  it("前提のない最初のレッスンは常に解放されている", () => {
    const lesson = makeLesson({ prerequisiteLessonId: undefined });
    expect(isLessonUnlocked(lesson, {})).toBe(true);
  });

  it("前提レッスンが未クリアならロックされる", () => {
    const lesson = makeLesson({ id: "11-02", prerequisiteLessonId: "11-01" });
    const progress = {
      "11-01": makeLessonProgress({
        correctlyAnsweredRequiredQuestionIds: ["q-1"],
      }),
    };
    expect(isLessonUnlocked(lesson, progress)).toBe(false);
  });

  it("前提レッスンをクリアすると解放される", () => {
    const lesson = makeLesson({ id: "11-02", prerequisiteLessonId: "11-01" });
    const progress = {
      "11-01": makeLessonProgress({
        correctlyAnsweredRequiredQuestionIds: ["q-1", "q-2"],
      }),
    };
    expect(isLessonUnlocked(lesson, progress)).toBe(true);
  });
});

describe("computeLessonStatus", () => {
  const first = makeLesson({ id: "11-01" });
  const second = makeLesson({ id: "11-02", prerequisiteLessonId: "11-01" });

  it("前提未クリアなら locked", () => {
    expect(computeLessonStatus(second, {}, {})).toBe("locked");
  });

  it("解放済みで未着手なら available", () => {
    expect(computeLessonStatus(first, {}, {})).toBe("available");
  });

  it("着手済みで未クリアなら in_progress", () => {
    const progress = {
      "11-01": makeLessonProgress({ startedAt: "2026-01-01T00:00:00.000Z" }),
    };
    expect(computeLessonStatus(first, progress, {})).toBe("in_progress");
  });

  it("必須問題をすべて正解したら completed", () => {
    const progress = {
      "11-01": makeLessonProgress({
        correctlyAnsweredRequiredQuestionIds: ["q-1", "q-2"],
      }),
    };
    expect(computeLessonStatus(first, progress, {})).toBe("completed");
  });

  it("全問題で連続2回以上正解なら mastered", () => {
    const progress = {
      "11-01": makeLessonProgress({
        correctlyAnsweredRequiredQuestionIds: ["q-1", "q-2"],
      }),
    };
    const questionProgress = {
      "q-1": makeQuestionProgress({ consecutiveCorrect: 2 }),
      "q-2": makeQuestionProgress({ consecutiveCorrect: 3 }),
    };
    expect(computeLessonStatus(first, progress, questionProgress)).toBe(
      "mastered",
    );
    expect(isLessonMastered(first, progress["11-01"], questionProgress)).toBe(
      true,
    );
  });
});

describe("applyCorrectAnswer", () => {
  it("必須問題の正解を記録する", () => {
    const progress = makeLessonProgress();
    const next = applyCorrectAnswer(progress, "q-1");
    expect(next.correctlyAnsweredRequiredQuestionIds).toEqual(["q-1"]);
    // 元のオブジェクトは変更しない
    expect(progress.correctlyAnsweredRequiredQuestionIds).toEqual([]);
  });

  it("同じ問題を二重に記録しない", () => {
    const progress = makeLessonProgress({
      correctlyAnsweredRequiredQuestionIds: ["q-1"],
    });
    const next = applyCorrectAnswer(progress, "q-1");
    expect(next.correctlyAnsweredRequiredQuestionIds).toEqual(["q-1"]);
  });

  it("必須でない問題は記録しない", () => {
    const progress = makeLessonProgress();
    const next = applyCorrectAnswer(progress, "q-999");
    expect(next.correctlyAnsweredRequiredQuestionIds).toEqual([]);
  });
});

describe("remainingRequiredQuestionIds", () => {
  it("未正解の必須問題だけを返す", () => {
    const progress = makeLessonProgress({
      requiredQuestionIds: ["q-1", "q-2", "q-3"],
      correctlyAnsweredRequiredQuestionIds: ["q-2"],
    });
    expect(remainingRequiredQuestionIds(progress)).toEqual(["q-1", "q-3"]);
  });

  it("進捗がなければ空配列", () => {
    expect(remainingRequiredQuestionIds(undefined)).toEqual([]);
  });
});
