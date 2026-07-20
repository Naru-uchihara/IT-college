import type { QuizMode } from "@/types";

/**
 * XP付与ルール(要件定義書 10.1)。
 * XPは学習意欲の補助であり、ステージ解放条件には使わない。
 */
export const XP_RULES = {
  correctAnswer: 10,
  firstLessonClear: 50,
  reviewCorrect: 5,
  chapterComplete: 100,
  perfectFirstTry: 20,
} as const;

/** 1問正解あたりのXP */
export function xpForCorrectAnswer(mode: QuizMode): number {
  return mode === "review" ? XP_RULES.reviewCorrect : XP_RULES.correctAnswer;
}

/** クイズ完了時のボーナスXP */
export function bonusXpForAttempt(options: {
  isFirstClear: boolean;
  isPerfectFirstTry: boolean;
  chapterJustCompleted: boolean;
}): number {
  let bonus = 0;
  if (options.isFirstClear) bonus += XP_RULES.firstLessonClear;
  if (options.isPerfectFirstTry) bonus += XP_RULES.perfectFirstTry;
  if (options.chapterJustCompleted) bonus += XP_RULES.chapterComplete;
  return bonus;
}
