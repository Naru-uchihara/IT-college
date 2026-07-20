"use client";

import Link from "next/link";
import { CheckCircle2, CircleX, Clock, Sparkles, Trophy } from "lucide-react";
import { getLessonById, getNextLesson } from "@/data";
import {
  isLessonCleared,
  remainingRequiredQuestionIds,
} from "@/domain/progress/unlock";
import { useProgress } from "@/hooks/use-progress";

type ResultViewProps = {
  attemptId: string;
};

/** クイズ結果画面 */
export function ResultView({ attemptId }: ResultViewProps) {
  const { ready, progress } = useProgress();

  if (!ready || !progress) {
    return (
      <p role="status" className="py-12 text-center text-slate-500">
        読み込み中...
      </p>
    );
  }

  const attempt = progress.attempts.find((a) => a.id === attemptId);
  if (!attempt) {
    return (
      <div className="py-12 text-center">
        <p className="text-slate-600">結果が見つかりませんでした。</p>
        <Link
          href="/learn"
          className="mt-4 inline-block rounded-xl bg-teal-600 px-5 py-2.5 font-bold text-white hover:bg-teal-700"
        >
          学習パスへ戻る
        </Link>
      </div>
    );
  }

  const isReview = attempt.mode === "review";
  const lesson = isReview ? undefined : getLessonById(attempt.lessonId);
  const lessonProgress = lesson
    ? progress.lessonProgress[lesson.id]
    : undefined;
  const cleared = lesson ? isLessonCleared(lessonProgress) : false;
  const remaining = lesson ? remainingRequiredQuestionIds(lessonProgress) : [];
  const nextLesson = lesson ? getNextLesson(lesson.id) : undefined;
  const accuracy =
    attempt.questionCount > 0
      ? Math.round((attempt.correctCount / attempt.questionCount) * 100)
      : 0;
  const incorrectCount = attempt.questionCount - attempt.correctCount;
  const requiredCorrectCount = lessonProgress
    ? lessonProgress.correctlyAnsweredRequiredQuestionIds.length
    : 0;
  const requiredTotal = lessonProgress
    ? lessonProgress.requiredQuestionIds.length
    : 0;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-2xl font-bold">
          {isReview ? "復習おつかれさまでした!" : "クイズ結果"}
        </h1>
        {lesson && (
          <p className="mt-1 text-sm text-slate-500">
            {lesson.code} {lesson.title}
          </p>
        )}

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-2xl font-bold text-teal-700">
              {attempt.correctCount}
              <span className="text-sm text-slate-500">
                /{attempt.questionCount}
              </span>
            </p>
            <p className="text-xs text-slate-500">正解数</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-2xl font-bold text-teal-700">{accuracy}%</p>
            <p className="text-xs text-slate-500">正答率</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="flex items-center justify-center gap-1 text-2xl font-bold text-amber-600">
              <Sparkles aria-hidden="true" className="h-5 w-5" />
              {attempt.earnedXp}
            </p>
            <p className="text-xs text-slate-500">獲得XP</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="flex items-center justify-center gap-1 text-2xl font-bold text-slate-700">
              <Clock aria-hidden="true" className="h-5 w-5" />
              {attempt.durationSeconds ?? 0}秒
            </p>
            <p className="text-xs text-slate-500">所要時間</p>
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-600">
          間違えた問題: {incorrectCount}問
          {incorrectCount > 0 && "(復習キューに追加済み)"}
        </p>
        {!isReview && requiredTotal > 0 && (
          <p className="mt-1 text-sm text-slate-600">
            必須問題の正解: {requiredCorrectCount}/{requiredTotal}問
          </p>
        )}
      </section>

      {!isReview && lesson && (
        <section
          aria-label="ステージクリア判定"
          className={`rounded-2xl border-2 p-5 text-center ${
            cleared
              ? "border-teal-500 bg-teal-50"
              : "border-amber-300 bg-amber-50"
          }`}
        >
          {cleared ? (
            <>
              <p className="flex items-center justify-center gap-2 text-lg font-bold text-teal-800">
                <Trophy aria-hidden="true" className="h-6 w-6 text-amber-500" />
                ステージクリア!
              </p>
              {nextLesson ? (
                <p className="mt-1 text-sm text-teal-900">
                  次のステージ「{nextLesson.code} {nextLesson.title}
                  」が解放されました。
                </p>
              ) : (
                <p className="mt-1 text-sm text-teal-900">
                  MVPの全ステージをクリアしました。おめでとうございます!
                </p>
              )}
            </>
          ) : (
            <>
              <p className="flex items-center justify-center gap-2 text-lg font-bold text-amber-800">
                <CircleX aria-hidden="true" className="h-6 w-6" />
                ステージクリアまであと少し
              </p>
              <p className="mt-1 text-sm text-amber-900">
                未正解の必須問題が {remaining.length} 問あります。
                復習で正解すればステージクリアになります。
              </p>
            </>
          )}
        </section>
      )}

      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
        {!isReview && cleared && nextLesson && (
          <Link
            href={`/lesson/${nextLesson.id}`}
            className="rounded-xl bg-teal-600 px-6 py-3 text-center font-bold text-white hover:bg-teal-700"
          >
            <CheckCircle2
              aria-hidden="true"
              className="mr-1.5 inline h-4 w-4"
            />
            次のステージへ進む
          </Link>
        )}
        {incorrectCount > 0 && (
          <Link
            href="/review"
            className="rounded-xl border border-teal-600 bg-white px-6 py-3 text-center font-bold text-teal-700 hover:bg-teal-50"
          >
            復習へ進む
          </Link>
        )}
        <Link
          href="/learn"
          className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-center font-medium text-slate-700 hover:bg-slate-50"
        >
          学習パスへ戻る
        </Link>
      </div>
    </div>
  );
}
