import {
  allLessons,
  getLessonById,
  getLessonsForChapter,
  getRequiredQuestionIds,
} from "@/data";
import {
  applyCorrectAnswer,
  computeAllLessonStatuses,
  isLessonCleared,
} from "@/domain/progress/unlock";
import { applyAnswerToQuestionProgress } from "@/domain/progress/review";
import { addStudyDate, toDateKey } from "@/domain/progress/streak";
import { bonusXpForAttempt, xpForCorrectAnswer } from "@/domain/quiz/xp";
import { createLocalProgressRepository } from "@/repositories/local-progress-repository";
import {
  createEmptyProgress,
  type ProgressRepository,
} from "@/repositories/progress-repository";
import type {
  LessonProgress,
  LocalProgress,
  Question,
  QuizAnswer,
  QuizAttempt,
  QuizMode,
} from "@/types";

/**
 * 進捗の読み書きを一手に引き受けるサービス。
 * React からは useProgress フック経由で購読する。
 */

type Listener = (progress: LocalProgress) => void;

export class ProgressService {
  private progress: LocalProgress;
  private listeners = new Set<Listener>();

  constructor(private repository: ProgressRepository) {
    this.progress = repository.load();
    this.refreshStatuses();
  }

  getProgress(): LocalProgress {
    return this.progress;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private commit(next: LocalProgress): void {
    this.progress = next;
    this.repository.save(next);
    for (const listener of this.listeners) listener(next);
  }

  /** レッスンの進捗レコードを保証して返す */
  private ensureLessonProgress(
    progress: LocalProgress,
    lessonId: string,
  ): LessonProgress {
    return (
      progress.lessonProgress[lessonId] ?? {
        status: "available",
        requiredQuestionIds: getRequiredQuestionIds(lessonId),
        correctlyAnsweredRequiredQuestionIds: [],
      }
    );
  }

  /** 全レッスンの status を最新の状態に再計算する */
  private refreshStatuses(): void {
    const statuses = computeAllLessonStatuses(allLessons, this.progress);
    const lessonProgress = { ...this.progress.lessonProgress };
    for (const lesson of allLessons) {
      const entry = this.ensureLessonProgress(this.progress, lesson.id);
      lessonProgress[lesson.id] = { ...entry, status: statuses[lesson.id] };
    }
    this.progress = { ...this.progress, lessonProgress };
  }

  /** 学習カードの閲覧開始(学習中フラグと現在地の更新) */
  startLesson(lessonId: string): void {
    const now = new Date().toISOString();
    const entry = this.ensureLessonProgress(this.progress, lessonId);
    const next: LocalProgress = {
      ...this.progress,
      currentLessonId: lessonId,
      lessonProgress: {
        ...this.progress.lessonProgress,
        [lessonId]: { ...entry, startedAt: entry.startedAt ?? now },
      },
    };
    this.progress = next;
    this.refreshStatuses();
    this.commit(this.progress);
  }

  /**
   * 1問の回答を記録する。
   * 問題進捗・必須問題の正解記録・XP・学習日をまとめて更新する。
   */
  recordAnswer(
    question: Question,
    selectedAnswer: string,
    isCorrect: boolean,
    mode: QuizMode,
  ): void {
    const now = new Date();
    const nowIso = now.toISOString();
    const progress = this.progress;

    const questionProgress = {
      ...progress.questionProgress,
      [question.id]: applyAnswerToQuestionProgress(
        progress.questionProgress[question.id],
        isCorrect,
        nowIso,
      ),
    };

    let lessonEntry = this.ensureLessonProgress(progress, question.lessonId);
    lessonEntry = {
      ...lessonEntry,
      startedAt: lessonEntry.startedAt ?? nowIso,
    };
    if (isCorrect) {
      const wasCleared = isLessonCleared(lessonEntry);
      lessonEntry = applyCorrectAnswer(lessonEntry, question.id);
      if (
        !wasCleared &&
        isLessonCleared(lessonEntry) &&
        !lessonEntry.completedAt
      ) {
        lessonEntry = { ...lessonEntry, completedAt: nowIso };
      }
    }

    const next: LocalProgress = {
      ...progress,
      questionProgress,
      lessonProgress: {
        ...progress.lessonProgress,
        [question.lessonId]: lessonEntry,
      },
      xp: progress.xp + (isCorrect ? xpForCorrectAnswer(mode) : 0),
      studyDates: addStudyDate(progress.studyDates, toDateKey(now)),
    };

    this.progress = next;
    this.refreshStatuses();
    this.commit(this.progress);
  }

  /**
   * クイズ1回分を完了として記録し、ボーナスXPを加算する。
   * 記録した attempt を返す(結果画面で参照する)。
   */
  completeAttempt(input: {
    lessonId: string;
    mode: QuizMode;
    startedAt: string;
    answers: QuizAnswer[];
  }): QuizAttempt {
    const now = new Date();
    const nowIso = now.toISOString();
    const progress = this.progress;
    const lessonEntry = progress.lessonProgress[input.lessonId];

    const correctCount = input.answers.filter((a) => a.isCorrect).length;

    // このクイズ中に初クリアが起きたか(completedAt が開始時刻以降)
    const isFirstClear =
      input.mode === "lesson" &&
      lessonEntry?.completedAt !== undefined &&
      lessonEntry.completedAt >= input.startedAt;

    const previousLessonAttempts = progress.attempts.filter(
      (a) => a.lessonId === input.lessonId && a.mode === "lesson",
    );
    const isPerfectFirstTry =
      input.mode === "lesson" &&
      previousLessonAttempts.length === 0 &&
      input.answers.length > 0 &&
      input.answers.every((a) => a.isCorrect);

    const lesson = getLessonById(input.lessonId);
    const chapterJustCompleted =
      isFirstClear &&
      lesson !== undefined &&
      getLessonsForChapter(lesson.chapterId).every((l) =>
        isLessonCleared(progress.lessonProgress[l.id]),
      );

    const bonus = bonusXpForAttempt({
      isFirstClear,
      isPerfectFirstTry,
      chapterJustCompleted,
    });

    const answerXp = input.answers
      .filter((a) => a.isCorrect)
      .reduce((sum) => sum + xpForCorrectAnswer(input.mode), 0);

    const attempt: QuizAttempt = {
      id: `attempt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      lessonId: input.lessonId,
      mode: input.mode,
      startedAt: input.startedAt,
      completedAt: nowIso,
      answers: input.answers,
      correctCount,
      questionCount: input.answers.length,
      earnedXp: answerXp + bonus,
      durationSeconds: Math.max(
        0,
        Math.round(
          (now.getTime() - new Date(input.startedAt).getTime()) / 1000,
        ),
      ),
    };

    const next: LocalProgress = {
      ...progress,
      attempts: [...progress.attempts, attempt],
      xp: progress.xp + bonus,
    };

    this.progress = next;
    this.refreshStatuses();
    this.commit(this.progress);
    return attempt;
  }

  /** 学習履歴をすべて初期化する */
  resetAll(): void {
    this.repository.reset();
    this.progress = createEmptyProgress();
    this.refreshStatuses();
    this.commit(this.progress);
  }
}

let singleton: ProgressService | undefined;

/** ブラウザ側で使うシングルトンを取得する */
export function getProgressService(): ProgressService {
  if (typeof window === "undefined") {
    // SSR中は保存しない一時インスタンス(描画用の空進捗)
    return new ProgressService({
      load: createEmptyProgress,
      save: () => {},
      reset: () => {},
    });
  }
  if (!singleton) {
    singleton = new ProgressService(createLocalProgressRepository());
  }
  return singleton;
}
