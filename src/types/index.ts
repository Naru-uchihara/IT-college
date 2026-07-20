/**
 * IT-college 共通型定義
 *
 * Phase 1 (localStorage) と Phase 2 (Supabase) の両方で使い回せるよう、
 * 教材・進捗の型はここに集約する。
 */

export type Difficulty = "beginner" | "basic" | "applied";

export type QuestionType = "multiple_choice" | "true_false" | "numeric";

export type Choice = {
  id: string;
  text: string;
};

export type Question = {
  id: string;
  courseId: string;
  chapterId: string;
  lessonId: string;
  type: QuestionType;
  difficulty: Difficulty;
  prompt: string;
  choices?: Choice[];
  /** multiple_choice の場合は正解の choice id */
  correctAnswer: string | number | boolean;
  explanation: string;
  /** choice id ごとの「なぜ誤りか」の説明 */
  incorrectExplanations?: Record<string, string>;
  relatedTerms: string[];
  isRequired: boolean;
  sourceType: "original" | "official_public_question";
  sourceLabel?: string;
  sourceUrl?: string;
  published: boolean;
};

export type LearningCard = {
  id: string;
  title: string;
  body: string;
  example?: string;
  keyPoints?: string[];
};

export type Lesson = {
  id: string;
  courseId: string;
  chapterId: string;
  /** 例: "11-01" */
  code: string;
  title: string;
  summary: string;
  learningObjectives: string[];
  cards: LearningCard[];
  questionIds: string[];
  order: number;
  prerequisiteLessonId?: string;
};

export type Chapter = {
  id: string;
  courseId: string;
  /** 例: "11" */
  code: string;
  title: string;
  order: number;
};

export type Course = {
  id: string;
  slug: string;
  title: string;
  description: string;
  order: number;
  /** MVP で教材が入っているか */
  available: boolean;
};

export type LessonStatus =
  "locked" | "available" | "in_progress" | "completed" | "mastered";

export type LessonProgress = {
  status: LessonStatus;
  requiredQuestionIds: string[];
  correctlyAnsweredRequiredQuestionIds: string[];
  startedAt?: string;
  completedAt?: string;
};

export type QuestionProgress = {
  attempts: number;
  correctCount: number;
  incorrectCount: number;
  consecutiveCorrect: number;
  lastAnsweredAt?: string;
  lastIncorrectAt?: string;
  nextReviewAt?: string;
};

export type QuizMode = "lesson" | "review";

export type QuizAnswer = {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  answeredAt: string;
};

export type QuizAttempt = {
  id: string;
  lessonId: string;
  mode: QuizMode;
  startedAt: string;
  completedAt?: string;
  answers: QuizAnswer[];
  correctCount: number;
  questionCount: number;
  earnedXp: number;
  /** 所要時間(秒) */
  durationSeconds?: number;
};

export type LocalProgress = {
  version: number;
  currentLessonId?: string;
  lessonProgress: Record<string, LessonProgress>;
  questionProgress: Record<string, QuestionProgress>;
  attempts: QuizAttempt[];
  xp: number;
  /** "YYYY-MM-DD" の学習日一覧(重複なし・昇順) */
  studyDates: string[];
};
