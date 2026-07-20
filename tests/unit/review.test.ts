import { describe, expect, it } from "vitest";
import {
  applyAnswerToQuestionProgress,
  buildReviewQueue,
  countPendingReview,
} from "@/domain/progress/review";
import { makeQuestion, makeQuestionProgress } from "./helpers";

describe("applyAnswerToQuestionProgress", () => {
  it("初回の不正解で誤答キュー入りの状態になる", () => {
    const next = applyAnswerToQuestionProgress(
      undefined,
      false,
      "2026-01-01T00:00:00.000Z",
    );
    expect(next.attempts).toBe(1);
    expect(next.incorrectCount).toBe(1);
    expect(next.consecutiveCorrect).toBe(0);
    expect(next.lastIncorrectAt).toBe("2026-01-01T00:00:00.000Z");
  });

  it("正解すると連続正解が伸びる", () => {
    const base = makeQuestionProgress({
      attempts: 2,
      correctCount: 1,
      incorrectCount: 1,
      consecutiveCorrect: 1,
    });
    const next = applyAnswerToQuestionProgress(
      base,
      true,
      "2026-01-02T00:00:00.000Z",
    );
    expect(next.correctCount).toBe(2);
    expect(next.consecutiveCorrect).toBe(2);
    // 誤答履歴は消えない
    expect(next.incorrectCount).toBe(1);
  });

  it("不正解で連続正解はリセットされる", () => {
    const base = makeQuestionProgress({ consecutiveCorrect: 3 });
    const next = applyAnswerToQuestionProgress(
      base,
      false,
      "2026-01-03T00:00:00.000Z",
    );
    expect(next.consecutiveCorrect).toBe(0);
    expect(next.lastIncorrectAt).toBe("2026-01-03T00:00:00.000Z");
  });
});

describe("buildReviewQueue", () => {
  const q1 = makeQuestion({ id: "q-1", lessonId: "11-01", chapterId: "ch11" });
  const q2 = makeQuestion({ id: "q-2", lessonId: "13-01", chapterId: "ch13" });
  const q3 = makeQuestion({ id: "q-3", lessonId: "11-01", chapterId: "ch11" });

  const progressMap = {
    // 誤答あり(古い)
    "q-1": makeQuestionProgress({
      attempts: 1,
      incorrectCount: 1,
      lastIncorrectAt: "2026-01-01T00:00:00.000Z",
    }),
    // 誤答あり(新しい)
    "q-2": makeQuestionProgress({
      attempts: 3,
      incorrectCount: 2,
      lastIncorrectAt: "2026-01-05T00:00:00.000Z",
    }),
    // 全問正解のみ → キューに入らない
    "q-3": makeQuestionProgress({ attempts: 2, correctCount: 2 }),
  };

  it("間違えた問題だけがキューに入る", () => {
    const queue = buildReviewQueue([q1, q2, q3], progressMap);
    expect(queue.map((item) => item.question.id)).toEqual(["q-2", "q-1"]);
  });

  it("直近の誤答が優先される(降順)", () => {
    const queue = buildReviewQueue([q1, q2], progressMap);
    expect(queue[0].question.id).toBe("q-2");
  });

  it("章で絞り込める", () => {
    const queue = buildReviewQueue([q1, q2], progressMap, {
      chapterId: "ch11",
    });
    expect(queue.map((item) => item.question.id)).toEqual(["q-1"]);
  });

  it("レッスンで絞り込める", () => {
    const queue = buildReviewQueue([q1, q2], progressMap, {
      lessonId: "13-01",
    });
    expect(queue.map((item) => item.question.id)).toEqual(["q-2"]);
  });

  it("一度も回答していない問題はキューに入らない", () => {
    const queue = buildReviewQueue([q1], {});
    expect(queue).toEqual([]);
  });
});

describe("countPendingReview", () => {
  it("正解し直せていない問題だけを数える", () => {
    const q1 = makeQuestion({ id: "q-1" });
    const q2 = makeQuestion({ id: "q-2" });
    const progressMap = {
      // 間違えたまま
      "q-1": makeQuestionProgress({
        attempts: 1,
        incorrectCount: 1,
        consecutiveCorrect: 0,
      }),
      // 間違えたが正解し直した
      "q-2": makeQuestionProgress({
        attempts: 2,
        correctCount: 1,
        incorrectCount: 1,
        consecutiveCorrect: 1,
      }),
    };
    expect(countPendingReview([q1, q2], progressMap)).toBe(1);
  });
});
