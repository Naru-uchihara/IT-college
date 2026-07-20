"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Check, Lock, Play, Star } from "lucide-react";
import { allChapters, allCourses, allLessons, getLessonById } from "@/data";
import { isLessonCleared } from "@/domain/progress/unlock";
import { useProgress } from "@/hooks/use-progress";
import type { Lesson, LessonStatus } from "@/types";

const statusLabels: Record<LessonStatus, string> = {
  locked: "ロック中",
  available: "挑戦できます",
  in_progress: "学習中",
  completed: "クリア済み",
  mastered: "マスター済み",
};

const statusStyles: Record<LessonStatus, string> = {
  locked: "border-slate-300 bg-slate-100 text-slate-400",
  available: "border-teal-500 bg-white text-teal-700 hover:bg-teal-50",
  in_progress: "border-teal-500 bg-teal-50 text-teal-700 hover:bg-teal-100",
  completed: "border-teal-600 bg-teal-600 text-white hover:bg-teal-700",
  mastered: "border-amber-500 bg-amber-400 text-amber-950 hover:bg-amber-300",
};

function StatusIcon({ status }: { status: LessonStatus }) {
  const className = "h-6 w-6";
  switch (status) {
    case "locked":
      return <Lock aria-hidden="true" className={className} />;
    case "available":
      return <Play aria-hidden="true" className={className} />;
    case "in_progress":
      return <BookOpen aria-hidden="true" className={className} />;
    case "completed":
      return <Check aria-hidden="true" className={className} />;
    case "mastered":
      return <Star aria-hidden="true" className={className} />;
  }
}

/** 縦型学習パス */
export function LearningPath() {
  const { ready, progress } = useProgress();
  const [selectedCourseId, setSelectedCourseId] = useState("technology");
  const [lockedMessage, setLockedMessage] = useState<string | null>(null);

  if (!ready || !progress) {
    return (
      <p role="status" className="py-12 text-center text-slate-500">
        読み込み中...
      </p>
    );
  }

  const handleLockedClick = (lesson: Lesson) => {
    const prerequisite = lesson.prerequisiteLessonId
      ? getLessonById(lesson.prerequisiteLessonId)
      : undefined;
    setLockedMessage(
      prerequisite
        ? `このステージはロック中です。「${prerequisite.code} ${prerequisite.title}」の必須問題をすべて正解するとクリアとなり、解放されます。`
        : "このステージはまだ解放されていません。",
    );
  };

  const courseChapters = allChapters.filter(
    (chapter) => chapter.courseId === selectedCourseId,
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">学習パス</h1>

      <div
        role="tablist"
        aria-label="コース切替"
        className="flex flex-wrap gap-2"
      >
        {allCourses.map((course) => (
          <button
            key={course.id}
            role="tab"
            aria-selected={selectedCourseId === course.id}
            disabled={!course.available}
            onClick={() => course.available && setSelectedCourseId(course.id)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
              selectedCourseId === course.id
                ? "border-teal-600 bg-teal-600 text-white"
                : course.available
                  ? "border-slate-300 bg-white text-slate-700 hover:border-teal-500"
                  : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
            }`}
          >
            {course.title}
            {!course.available && "(準備中)"}
          </button>
        ))}
      </div>

      {lockedMessage && (
        <p
          role="status"
          className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800"
        >
          {lockedMessage}
        </p>
      )}

      {courseChapters.map((chapter) => {
        const lessons = allLessons.filter(
          (lesson) => lesson.chapterId === chapter.id,
        );
        const clearedCount = lessons.filter((lesson) =>
          isLessonCleared(progress.lessonProgress[lesson.id]),
        ).length;
        const percent =
          lessons.length > 0
            ? Math.round((clearedCount / lessons.length) * 100)
            : 0;

        return (
          <section key={chapter.id} aria-labelledby={`chapter-${chapter.id}`}>
            <div className="rounded-xl bg-slate-800 px-4 py-3 text-white">
              <h2 id={`chapter-${chapter.id}`} className="font-bold">
                第{chapter.code}章 {chapter.title}
              </h2>
              <p className="text-xs text-slate-300">
                進捗 {clearedCount}/{lessons.length} レッスン({percent}%)
              </p>
            </div>

            <ol className="relative mx-auto mt-4 mb-8 flex w-fit flex-col items-center gap-4">
              {lessons.map((lesson, index) => {
                const status =
                  progress.lessonProgress[lesson.id]?.status ?? "locked";
                const isCurrent =
                  status === "available" || status === "in_progress";
                const node = (
                  <span
                    className={`flex h-16 w-16 items-center justify-center rounded-full border-4 shadow-sm ${statusStyles[status]}`}
                  >
                    <StatusIcon status={status} />
                  </span>
                );

                return (
                  <li
                    key={lesson.id}
                    className={`flex flex-col items-center ${index % 2 === 0 ? "sm:translate-x-6" : "sm:-translate-x-6"}`}
                  >
                    {status === "locked" ? (
                      <button
                        onClick={() => handleLockedClick(lesson)}
                        aria-label={`${lesson.code} ${lesson.title}(ロック中)`}
                        className="flex flex-col items-center gap-1"
                      >
                        {node}
                        <span className="max-w-40 text-center text-xs font-medium text-slate-400">
                          {lesson.code} {lesson.title}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {statusLabels[status]}
                        </span>
                      </button>
                    ) : (
                      <Link
                        href={`/lesson/${lesson.id}`}
                        aria-label={`${lesson.code} ${lesson.title}(${statusLabels[status]})`}
                        aria-current={isCurrent ? "step" : undefined}
                        className="flex flex-col items-center gap-1"
                      >
                        {node}
                        <span className="max-w-40 text-center text-xs font-medium text-slate-700">
                          {lesson.code} {lesson.title}
                        </span>
                        <span
                          className={`text-[11px] ${isCurrent ? "font-bold text-teal-700" : "text-slate-500"}`}
                        >
                          {isCurrent ? "▶ 現在地: " : ""}
                          {statusLabels[status]}
                        </span>
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
