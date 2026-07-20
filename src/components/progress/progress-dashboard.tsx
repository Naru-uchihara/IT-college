"use client";

import { BarChart3, Trash2 } from "lucide-react";
import { ProgressBar } from "@/components/ui/progress-bar";
import { allChapters, allLessons, getLessonById } from "@/data";
import { computeStreak } from "@/domain/progress/streak";
import { isLessonCleared } from "@/domain/progress/unlock";
import { useProgress } from "@/hooks/use-progress";

/** 学習記録画面: 進捗・正答率・XP履歴・リセット */
export function ProgressDashboard() {
  const { ready, progress, service } = useProgress();

  if (!ready || !progress || !service) {
    return (
      <p role="status" className="py-12 text-center text-slate-500">
        読み込み中...
      </p>
    );
  }

  const clearedLessons = allLessons.filter((lesson) =>
    isLessonCleared(progress.lessonProgress[lesson.id]),
  );

  // 章別の正答率(回答済みの問題進捗から算出)
  const chapterStats = allChapters.map((chapter) => {
    const lessonIds = new Set(
      allLessons
        .filter((lesson) => lesson.chapterId === chapter.id)
        .map((lesson) => lesson.id),
    );
    let correct = 0;
    let total = 0;
    for (const lesson of allLessons) {
      if (!lessonIds.has(lesson.id)) continue;
      for (const questionId of lesson.questionIds) {
        const qp = progress.questionProgress[questionId];
        if (!qp) continue;
        correct += qp.correctCount;
        total += qp.attempts;
      }
    }
    return {
      chapter,
      accuracy: total > 0 ? Math.round((correct / total) * 100) : null,
      total,
    };
  });

  const answeredStats = chapterStats.filter((s) => s.accuracy !== null);
  const weakest =
    answeredStats.length > 0
      ? answeredStats.reduce((min, s) =>
          (s.accuracy ?? 100) < (min.accuracy ?? 100) ? s : min,
        )
      : null;

  const totalAnswers = Object.values(progress.questionProgress).reduce(
    (sum, qp) => sum + qp.attempts,
    0,
  );
  const reviewCorrect = progress.attempts
    .filter((a) => a.mode === "review")
    .reduce((sum, a) => sum + a.correctCount, 0);
  const streak = computeStreak(progress.studyDates, new Date());
  const recentAttempts = [...progress.attempts].slice(-5).reverse();

  const handleReset = () => {
    if (
      window.confirm(
        "学習履歴をすべて初期化します。XP・進捗・復習キューが消去され、元に戻せません。よろしいですか?",
      )
    ) {
      service.resetAll();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 aria-hidden="true" className="h-6 w-6 text-brand" />
        <h1 className="text-2xl font-bold">学習記録</h1>
      </div>

      <section
        aria-label="全体進捗"
        className="rounded-xl border border-slate-200 bg-white p-4"
      >
        <h2 className="font-bold">全体進捗(テクノロジ系 MVP)</h2>
        <p className="mt-2 text-sm text-slate-600">
          クリア済みレッスン: {clearedLessons.length} / {allLessons.length}
        </p>
        <div className="mt-2">
          <ProgressBar
            value={clearedLessons.length}
            max={allLessons.length}
            label="全体の進捗"
          />
        </div>
      </section>

      <section
        aria-label="学習統計"
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
          <p className="text-xl font-bold text-amber-600">{progress.xp}</p>
          <p className="text-xs text-slate-500">総XP</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
          <p className="text-xl font-bold">{streak}日</p>
          <p className="text-xs text-slate-500">連続学習日数</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
          <p className="text-xl font-bold">{totalAnswers}問</p>
          <p className="text-xs text-slate-500">回答した問題</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
          <p className="text-xl font-bold">{reviewCorrect}問</p>
          <p className="text-xs text-slate-500">復習で正解</p>
        </div>
      </section>

      <section
        aria-label="章別の正答率"
        className="rounded-xl border border-slate-200 bg-white p-4"
      >
        <h2 className="font-bold">章別の正答率</h2>
        <ul className="mt-3 space-y-3">
          {chapterStats.map(({ chapter, accuracy, total }) => (
            <li key={chapter.id}>
              <div className="flex items-baseline justify-between text-sm">
                <span>
                  第{chapter.code}章 {chapter.title}
                </span>
                <span className="font-bold text-slate-700">
                  {accuracy === null ? "未回答" : `${accuracy}%(${total}回)`}
                </span>
              </div>
              <div className="mt-1">
                <ProgressBar
                  value={accuracy ?? 0}
                  max={100}
                  label={`第${chapter.code}章の正答率`}
                />
              </div>
            </li>
          ))}
        </ul>
        {weakest && (weakest.accuracy ?? 100) < 80 && (
          <p className="mt-3 rounded-lg bg-amber-50 p-2 text-sm text-amber-800">
            苦手章: 第{weakest.chapter.code}章 {weakest.chapter.title}
            (正答率{weakest.accuracy}%)。復習で克服しましょう。
          </p>
        )}
      </section>

      <section
        aria-label="XP履歴"
        className="rounded-xl border border-slate-200 bg-white p-4"
      >
        <h2 className="font-bold">最近の学習(XP履歴)</h2>
        {recentAttempts.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">まだ履歴がありません。</p>
        ) : (
          <ul className="mt-2 divide-y divide-slate-100 text-sm">
            {recentAttempts.map((attempt) => {
              const lesson = getLessonById(attempt.lessonId);
              return (
                <li
                  key={attempt.id}
                  className="flex items-center justify-between gap-2 py-2"
                >
                  <span className="text-slate-600">
                    {new Date(
                      attempt.completedAt ?? attempt.startedAt,
                    ).toLocaleString("ja-JP")}{" "}
                    {attempt.mode === "review"
                      ? "復習"
                      : (lesson?.code ?? attempt.lessonId)}
                  </span>
                  <span className="font-bold text-amber-600">
                    +{attempt.earnedXp} XP
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section
        aria-label="データの初期化"
        className="rounded-xl border border-rose-200 bg-rose-50 p-4"
      >
        <h2 className="font-bold text-rose-800">学習履歴の初期化</h2>
        <p className="mt-1 text-sm text-rose-700">
          この端末に保存された学習履歴をすべて消去します。この操作は取り消せません。
        </p>
        <button
          onClick={handleReset}
          className="mt-3 flex items-center gap-1.5 rounded-xl border border-rose-400 bg-white px-4 py-2 text-sm font-bold text-rose-700 hover:bg-rose-100"
        >
          <Trash2 aria-hidden="true" className="h-4 w-4" />
          学習履歴をリセットする
        </button>
      </section>
    </div>
  );
}
