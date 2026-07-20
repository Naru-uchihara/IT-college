"use client";

import { useState } from "react";
import Link from "next/link";
import { PlayCircle, RotateCcw } from "lucide-react";
import { allChapters, allLessons, allQuestions, getLessonById } from "@/data";
import { buildReviewQueue, countPendingReview } from "@/domain/progress/review";
import { useProgress } from "@/hooks/use-progress";

/** 復習画面: 誤答キューの一覧・絞り込み・復習開始 */
export function ReviewList() {
  const { ready, progress } = useProgress();
  const [chapterId, setChapterId] = useState("");
  const [lessonId, setLessonId] = useState("");

  if (!ready || !progress) {
    return (
      <p role="status" className="py-12 text-center text-slate-500">
        読み込み中...
      </p>
    );
  }

  const filter = {
    chapterId: chapterId || undefined,
    lessonId: lessonId || undefined,
  };
  const queue = buildReviewQueue(
    allQuestions,
    progress.questionProgress,
    filter,
  );
  const pendingToday = countPendingReview(
    allQuestions,
    progress.questionProgress,
  );

  const lessonOptions = chapterId
    ? allLessons.filter((lesson) => lesson.chapterId === chapterId)
    : allLessons;

  const startHref = (() => {
    const params = new URLSearchParams();
    if (chapterId) params.set("chapter", chapterId);
    if (lessonId) params.set("lesson", lessonId);
    const query = params.toString();
    return `/quiz/review${query ? `?${query}` : ""}`;
  })();

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <RotateCcw aria-hidden="true" className="h-6 w-6 text-brand" />
        <h1 className="text-2xl font-bold">復習</h1>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm text-slate-600">
          今日の復習(まだ正解し直せていない問題):{" "}
          <span className="text-lg font-bold text-teal-700">
            {pendingToday}問
          </span>
        </p>
        <p className="mt-1 text-xs text-slate-500">
          間違えた問題は自動でここに追加されます。正解しても履歴は残り、何度でも挑戦できます。
        </p>
      </section>

      <section
        aria-label="絞り込み"
        className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label
            htmlFor="filter-chapter"
            className="mb-1 block text-xs font-medium text-slate-600"
          >
            章で絞り込み
          </label>
          <select
            id="filter-chapter"
            value={chapterId}
            onChange={(e) => {
              setChapterId(e.target.value);
              setLessonId("");
            }}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">すべての章</option>
            {allChapters.map((chapter) => (
              <option key={chapter.id} value={chapter.id}>
                第{chapter.code}章 {chapter.title}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label
            htmlFor="filter-lesson"
            className="mb-1 block text-xs font-medium text-slate-600"
          >
            レッスンで絞り込み
          </label>
          <select
            id="filter-lesson"
            value={lessonId}
            onChange={(e) => setLessonId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">すべてのレッスン</option>
            {lessonOptions.map((lesson) => (
              <option key={lesson.id} value={lesson.id}>
                {lesson.code} {lesson.title}
              </option>
            ))}
          </select>
        </div>
        {queue.length > 0 && (
          <Link
            href={startHref}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 px-5 py-2.5 font-bold text-white hover:bg-teal-700"
          >
            <PlayCircle aria-hidden="true" className="h-5 w-5" />
            復習を始める({queue.length}問)
          </Link>
        )}
      </section>

      {queue.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
          この条件で復習する問題はありません。
        </p>
      ) : (
        <ol aria-label="間違えた問題の一覧" className="space-y-3">
          {queue.map(({ question, progress: qp }) => {
            const lesson = getLessonById(question.lessonId);
            return (
              <li
                key={question.id}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <p className="text-xs font-medium text-slate-500">
                  {lesson
                    ? `${lesson.code} ${lesson.title}`
                    : question.lessonId}
                </p>
                <p className="mt-1 text-sm font-medium leading-relaxed">
                  {question.prompt}
                </p>
                <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <div className="flex gap-1">
                    <dt>誤答回数:</dt>
                    <dd className="font-bold text-rose-600">
                      {qp.incorrectCount}回
                    </dd>
                  </div>
                  <div className="flex gap-1">
                    <dt>連続正解:</dt>
                    <dd className="font-bold text-teal-700">
                      {qp.consecutiveCorrect}回
                    </dd>
                  </div>
                  {qp.lastIncorrectAt && (
                    <div className="flex gap-1">
                      <dt>最終誤答:</dt>
                      <dd>
                        {new Date(qp.lastIncorrectAt).toLocaleString("ja-JP")}
                      </dd>
                    </div>
                  )}
                </dl>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
