"use client";

import Link from "next/link";
import { ArrowRight, Flame, RotateCcw, Sparkles } from "lucide-react";
import { allLessons, allQuestions, getLessonById } from "@/data";
import { computeStreak } from "@/domain/progress/streak";
import { countPendingReview } from "@/domain/progress/review";
import { useProgress } from "@/hooks/use-progress";

/** トップページ: 今日の学習・復習件数・XP・連続学習日数 */
export function HomeDashboard() {
  const { ready, progress } = useProgress();

  if (!ready || !progress) {
    return (
      <p role="status" className="py-12 text-center text-slate-500">
        読み込み中...
      </p>
    );
  }

  // 「続きから」: 現在地 > 最初の挑戦可能レッスン
  const currentLesson = progress.currentLessonId
    ? getLessonById(progress.currentLessonId)
    : undefined;
  const nextAvailable = allLessons.find((lesson) => {
    const status = progress.lessonProgress[lesson.id]?.status;
    return status === "available" || status === "in_progress";
  });
  const continueLesson =
    currentLesson &&
    progress.lessonProgress[currentLesson.id]?.status !== "completed" &&
    progress.lessonProgress[currentLesson.id]?.status !== "mastered"
      ? currentLesson
      : (nextAvailable ?? currentLesson ?? allLessons[0]);

  const reviewCount = countPendingReview(
    allQuestions,
    progress.questionProgress,
  );
  const streak = computeStreak(progress.studyDates, new Date());
  const lastAttempt = progress.attempts[progress.attempts.length - 1];
  const lastAttemptLesson = lastAttempt
    ? getLessonById(lastAttempt.lessonId)
    : undefined;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-br from-teal-600 to-teal-700 p-6 text-white shadow-sm">
        <h1 className="text-2xl font-bold">今日の学習</h1>
        <p className="mt-1 text-sm text-teal-50">
          1回5〜10分。少しずつ、確実に。
        </p>
        {continueLesson && (
          <Link
            href={`/lesson/${continueLesson.id}`}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-teal-700 shadow hover:bg-teal-50"
          >
            続きから学ぶ: {continueLesson.code} {continueLesson.title}
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        )}
        <div className="mt-3">
          <Link
            href="/learn"
            className="text-sm font-medium text-teal-100 underline underline-offset-4 hover:text-white"
          >
            学習パスを見る
          </Link>
        </div>
      </section>

      <section aria-label="学習状況" className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
          <Sparkles
            aria-hidden="true"
            className="mx-auto h-5 w-5 text-amber-500"
          />
          <p className="mt-1 text-xl font-bold">{progress.xp}</p>
          <p className="text-xs text-slate-500">総XP</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
          <Flame
            aria-hidden="true"
            className="mx-auto h-5 w-5 text-orange-500"
          />
          <p className="mt-1 text-xl font-bold">{streak}日</p>
          <p className="text-xs text-slate-500">連続学習</p>
        </div>
        <Link
          href="/review"
          className="rounded-xl border border-slate-200 bg-white p-4 text-center hover:border-brand"
        >
          <RotateCcw
            aria-hidden="true"
            className="mx-auto h-5 w-5 text-brand"
          />
          <p className="mt-1 text-xl font-bold">{reviewCount}問</p>
          <p className="text-xs text-slate-500">今日の復習</p>
        </Link>
      </section>

      <section
        aria-label="直近の学習"
        className="rounded-xl border border-slate-200 bg-white p-4"
      >
        <h2 className="font-bold">直近の学習</h2>
        {lastAttempt ? (
          <p className="mt-2 text-sm text-slate-600">
            {new Date(
              lastAttempt.completedAt ?? lastAttempt.startedAt,
            ).toLocaleString("ja-JP")}{" "}
            に「{lastAttemptLesson?.title ?? lastAttempt.lessonId}」
            {lastAttempt.mode === "review" ? "の復習" : "のクイズ"}で{" "}
            {lastAttempt.questionCount}問中{lastAttempt.correctCount}問正解 (+
            {lastAttempt.earnedXp} XP)
          </p>
        ) : (
          <p className="mt-2 text-sm text-slate-600">
            まだ学習履歴がありません。最初のレッスンから始めましょう。
          </p>
        )}
      </section>
    </div>
  );
}
