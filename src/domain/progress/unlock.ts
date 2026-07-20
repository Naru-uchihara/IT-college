import type {
  Lesson,
  LessonProgress,
  LessonStatus,
  LocalProgress,
  QuestionProgress,
} from "@/types";

/**
 * ステージ解放判定(純粋関数)。
 *
 * ルール:
 * - 必須問題をすべて一度以上正解したレッスンは「クリア済み」。
 * - 前提レッスン(prerequisiteLessonId)がクリア済みになると次が解放される。
 * - 前提のないレッスン(最初のステージ)は常に解放されている。
 */

/** 必須問題がすべて正解済みかどうか */
export function isLessonCleared(progress: LessonProgress | undefined): boolean {
  if (!progress) return false;
  if (progress.requiredQuestionIds.length === 0) return false;
  const answered = new Set(progress.correctlyAnsweredRequiredQuestionIds);
  return progress.requiredQuestionIds.every((id) => answered.has(id));
}

/** レッスンが解放されているか(前提レッスンがクリア済みか) */
export function isLessonUnlocked(
  lesson: Lesson,
  lessonProgress: Record<string, LessonProgress>,
): boolean {
  if (!lesson.prerequisiteLessonId) return true;
  return isLessonCleared(lessonProgress[lesson.prerequisiteLessonId]);
}

/**
 * マスタリー判定: クリア済みかつ、レッスン内の全問題で
 * 連続正解が2回以上になっている状態。
 */
export function isLessonMastered(
  lesson: Lesson,
  lessonProgress: LessonProgress | undefined,
  questionProgress: Record<string, QuestionProgress>,
): boolean {
  if (!isLessonCleared(lessonProgress)) return false;
  return lesson.questionIds.every(
    (id) => (questionProgress[id]?.consecutiveCorrect ?? 0) >= 2,
  );
}

/** 1レッスン分の状態を導出する */
export function computeLessonStatus(
  lesson: Lesson,
  lessonProgress: Record<string, LessonProgress>,
  questionProgress: Record<string, QuestionProgress>,
): LessonStatus {
  const own = lessonProgress[lesson.id];
  if (!isLessonUnlocked(lesson, lessonProgress)) return "locked";
  if (isLessonCleared(own)) {
    return isLessonMastered(lesson, own, questionProgress)
      ? "mastered"
      : "completed";
  }
  if (own?.startedAt) return "in_progress";
  return "available";
}

/** 全レッスンの状態を一括導出する */
export function computeAllLessonStatuses(
  lessons: Lesson[],
  progress: Pick<LocalProgress, "lessonProgress" | "questionProgress">,
): Record<string, LessonStatus> {
  const result: Record<string, LessonStatus> = {};
  for (const lesson of lessons) {
    result[lesson.id] = computeLessonStatus(
      lesson,
      progress.lessonProgress,
      progress.questionProgress,
    );
  }
  return result;
}

/**
 * 必須問題の正解を進捗へ反映する。
 * 既に記録済みの問題は重複追加しない。新しいオブジェクトを返す(破壊的変更なし)。
 */
export function applyCorrectAnswer(
  progress: LessonProgress,
  questionId: string,
): LessonProgress {
  if (!progress.requiredQuestionIds.includes(questionId)) return progress;
  if (progress.correctlyAnsweredRequiredQuestionIds.includes(questionId)) {
    return progress;
  }
  return {
    ...progress,
    correctlyAnsweredRequiredQuestionIds: [
      ...progress.correctlyAnsweredRequiredQuestionIds,
      questionId,
    ],
  };
}

/** クリアに必要な残りの必須問題ID */
export function remainingRequiredQuestionIds(
  progress: LessonProgress | undefined,
): string[] {
  if (!progress) return [];
  const answered = new Set(progress.correctlyAnsweredRequiredQuestionIds);
  return progress.requiredQuestionIds.filter((id) => !answered.has(id));
}
