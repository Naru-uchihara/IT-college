import { z } from "zod";
import type { LocalProgress } from "@/types";
import {
  PROGRESS_SCHEMA_VERSION,
  createEmptyProgress,
  type ProgressRepository,
} from "./progress-repository";

export const STORAGE_KEY = "it-college.progress";

const lessonStatusSchema = z.enum([
  "locked",
  "available",
  "in_progress",
  "completed",
  "mastered",
]);

const lessonProgressSchema = z.object({
  status: lessonStatusSchema,
  requiredQuestionIds: z.array(z.string()),
  correctlyAnsweredRequiredQuestionIds: z.array(z.string()),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
});

const questionProgressSchema = z.object({
  attempts: z.number(),
  correctCount: z.number(),
  incorrectCount: z.number(),
  consecutiveCorrect: z.number(),
  lastAnsweredAt: z.string().optional(),
  lastIncorrectAt: z.string().optional(),
  nextReviewAt: z.string().optional(),
});

const quizAnswerSchema = z.object({
  questionId: z.string(),
  selectedAnswer: z.string(),
  isCorrect: z.boolean(),
  answeredAt: z.string(),
});

const quizAttemptSchema = z.object({
  id: z.string(),
  lessonId: z.string(),
  mode: z.enum(["lesson", "review"]),
  startedAt: z.string(),
  completedAt: z.string().optional(),
  answers: z.array(quizAnswerSchema),
  correctCount: z.number(),
  questionCount: z.number(),
  earnedXp: z.number(),
  durationSeconds: z.number().optional(),
});

const localProgressSchema = z.object({
  version: z.number(),
  currentLessonId: z.string().optional(),
  lessonProgress: z.record(z.string(), lessonProgressSchema),
  questionProgress: z.record(z.string(), questionProgressSchema),
  attempts: z.array(quizAttemptSchema),
  xp: z.number(),
  studyDates: z.array(z.string()),
});

/**
 * localStorage 実装。
 * - データにはスキーマバージョンを持たせる。
 * - 破損データや未知のバージョンは初期値へフォールバックし、アプリを落とさない。
 */
export class LocalProgressRepository implements ProgressRepository {
  constructor(
    private storage: Pick<Storage, "getItem" | "setItem" | "removeItem">,
  ) {}

  load(): LocalProgress {
    try {
      const raw = this.storage.getItem(STORAGE_KEY);
      if (!raw) return createEmptyProgress();
      const parsed: unknown = JSON.parse(raw);
      const result = localProgressSchema.safeParse(parsed);
      if (!result.success) return createEmptyProgress();
      if (result.data.version !== PROGRESS_SCHEMA_VERSION) {
        // 将来バージョンが変わったときはここでマイグレーションを行う。
        // 未知のバージョンは安全のため初期化する。
        return createEmptyProgress();
      }
      return result.data;
    } catch {
      return createEmptyProgress();
    }
  }

  save(progress: LocalProgress): void {
    try {
      this.storage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // 保存失敗(容量超過など)でもアプリは継続する
    }
  }

  reset(): void {
    try {
      this.storage.removeItem(STORAGE_KEY);
    } catch {
      // 失敗しても継続
    }
  }
}

/** ブラウザ環境用のRepositoryを生成する */
export function createLocalProgressRepository(): ProgressRepository {
  return new LocalProgressRepository(window.localStorage);
}
