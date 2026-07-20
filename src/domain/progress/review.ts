import type { Question, QuestionProgress } from "@/types";

/**
 * 誤答復習キュー(純粋関数)。
 *
 * Phase 1 のルール:
 * - 一度でも間違えた問題はキューに入る(正解しても履歴は残る)。
 * - 直近の誤答を優先して並べる。
 * - 章別・レッスン別に絞り込める。
 */

export type ReviewQueueItem = {
  question: Question;
  progress: QuestionProgress;
};

export type ReviewFilter = {
  chapterId?: string;
  lessonId?: string;
};

/** 誤答履歴のある問題をキューとして抽出する */
export function buildReviewQueue(
  questions: Question[],
  questionProgress: Record<string, QuestionProgress>,
  filter: ReviewFilter = {},
): ReviewQueueItem[] {
  const items: ReviewQueueItem[] = [];
  for (const question of questions) {
    const progress = questionProgress[question.id];
    if (!progress || progress.incorrectCount === 0) continue;
    if (filter.chapterId && question.chapterId !== filter.chapterId) continue;
    if (filter.lessonId && question.lessonId !== filter.lessonId) continue;
    items.push({ question, progress });
  }
  return sortByRecentIncorrect(items);
}

/** 直近の誤答が先頭になるよう並べ替える */
function sortByRecentIncorrect(items: ReviewQueueItem[]): ReviewQueueItem[] {
  return [...items].sort((a, b) => {
    const timeA = a.progress.lastIncorrectAt ?? "";
    const timeB = b.progress.lastIncorrectAt ?? "";
    return timeB.localeCompare(timeA);
  });
}

/**
 * 「今日の復習」: まだ一度も正解し直せていない誤答問題
 * (最後の回答が不正解のままの問題)を数える。
 */
export function countPendingReview(
  questions: Question[],
  questionProgress: Record<string, QuestionProgress>,
): number {
  return buildReviewQueue(questions, questionProgress).filter(
    ({ progress }) => progress.consecutiveCorrect === 0,
  ).length;
}

/**
 * 回答結果を問題進捗へ反映する。新しいオブジェクトを返す。
 */
export function applyAnswerToQuestionProgress(
  progress: QuestionProgress | undefined,
  isCorrect: boolean,
  answeredAt: string,
): QuestionProgress {
  const base: QuestionProgress = progress ?? {
    attempts: 0,
    correctCount: 0,
    incorrectCount: 0,
    consecutiveCorrect: 0,
  };
  if (isCorrect) {
    return {
      ...base,
      attempts: base.attempts + 1,
      correctCount: base.correctCount + 1,
      consecutiveCorrect: base.consecutiveCorrect + 1,
      lastAnsweredAt: answeredAt,
    };
  }
  return {
    ...base,
    attempts: base.attempts + 1,
    incorrectCount: base.incorrectCount + 1,
    consecutiveCorrect: 0,
    lastAnsweredAt: answeredAt,
    lastIncorrectAt: answeredAt,
  };
}
