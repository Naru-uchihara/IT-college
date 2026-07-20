import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { QuizRunner } from "@/components/quiz/quiz-runner";
import { getLessonById, getQuestionsForLesson } from "@/data";

type PageProps = {
  params: Promise<{ lessonId: string }>;
  searchParams: Promise<{ chapter?: string; lesson?: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lessonId } = await params;
  if (lessonId === "review") return { title: "復習クイズ" };
  const lesson = getLessonById(lessonId);
  return {
    title: lesson ? `クイズ: ${lesson.code} ${lesson.title}` : "クイズ",
  };
}

/**
 * クイズページ。
 * - /quiz/[lessonId]: レッスンの確認クイズ
 * - /quiz/review?chapter=...&lesson=...: 復習クイズ(誤答キューから出題)
 */
export default async function QuizPage({ params, searchParams }: PageProps) {
  const { lessonId } = await params;

  if (lessonId === "review") {
    const { chapter, lesson } = await searchParams;
    return (
      <QuizRunner
        mode="review"
        filter={{ chapterId: chapter, lessonId: lesson }}
      />
    );
  }

  const lesson = getLessonById(lessonId);
  if (!lesson) notFound();
  return (
    <QuizRunner
      mode="lesson"
      lessonId={lesson.id}
      lessonQuestions={getQuestionsForLesson(lesson.id)}
    />
  );
}
