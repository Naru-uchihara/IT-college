"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Lightbulb, PencilLine } from "lucide-react";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useProgress } from "@/hooks/use-progress";
import type { Lesson } from "@/types";

type LessonViewerProps = {
  lesson: Lesson;
};

/** 学習カードのビューア(カード送り + クイズ開始) */
export function LessonViewer({ lesson }: LessonViewerProps) {
  const router = useRouter();
  const { ready, progress, service } = useProgress();
  const [cardIndex, setCardIndex] = useState(0);

  // レッスンを開いたら「学習中」として記録する
  useEffect(() => {
    if (ready && service) service.startLesson(lesson.id);
  }, [ready, service, lesson.id]);

  if (!ready || !progress) {
    return (
      <p role="status" className="py-12 text-center text-slate-500">
        読み込み中...
      </p>
    );
  }

  // 未解放レッスンへの直接アクセスはパスへ戻す
  const status = progress.lessonProgress[lesson.id]?.status;
  if (status === "locked") {
    return (
      <div className="py-12 text-center">
        <p className="text-slate-600">
          このレッスンはまだ解放されていません。前のレッスンをクリアしてください。
        </p>
        <Link
          href="/learn"
          className="mt-4 inline-block rounded-xl bg-teal-600 px-5 py-2.5 font-bold text-white hover:bg-teal-700"
        >
          学習パスへ戻る
        </Link>
      </div>
    );
  }

  const card = lesson.cards[cardIndex];
  const isLastCard = cardIndex === lesson.cards.length - 1;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-slate-500">レッスン {lesson.code}</p>
        <h1 className="text-2xl font-bold">{lesson.title}</h1>
      </div>

      <section
        aria-label="学習目標"
        className="rounded-xl border border-slate-200 bg-white p-4"
      >
        <h2 className="text-sm font-bold text-slate-700">このレッスンの目標</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
          {lesson.learningObjectives.map((objective) => (
            <li key={objective}>{objective}</li>
          ))}
        </ul>
      </section>

      <div className="space-y-2">
        <p className="text-sm text-slate-500">
          学習カード {cardIndex + 1} / {lesson.cards.length}
        </p>
        <ProgressBar
          value={cardIndex + 1}
          max={lesson.cards.length}
          label="学習カードの進捗"
        />
      </div>

      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-teal-800">{card.title}</h2>
        <p className="mt-3 leading-relaxed text-slate-700">{card.body}</p>
        {card.example && (
          <div className="mt-4 flex gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
            <Lightbulb
              aria-hidden="true"
              className="h-5 w-5 shrink-0 text-amber-500"
            />
            <p>
              <span className="font-bold">例: </span>
              {card.example}
            </p>
          </div>
        )}
        {card.keyPoints && card.keyPoints.length > 0 && (
          <div className="mt-4 rounded-xl bg-teal-50 p-3">
            <h3 className="text-sm font-bold text-teal-800">ポイント</h3>
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-teal-900">
              {card.keyPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        )}
      </article>

      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => setCardIndex((i) => Math.max(0, i - 1))}
          disabled={cardIndex === 0}
          className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          前へ
        </button>
        {isLastCard ? (
          <button
            onClick={() => router.push(`/quiz/${lesson.id}`)}
            className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-5 py-2.5 font-bold text-white hover:bg-teal-700"
          >
            <PencilLine aria-hidden="true" className="h-4 w-4" />
            確認クイズを始める
          </button>
        ) : (
          <button
            onClick={() =>
              setCardIndex((i) => Math.min(lesson.cards.length - 1, i + 1))
            }
            className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-5 py-2.5 font-bold text-white hover:bg-teal-700"
          >
            次へ
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
