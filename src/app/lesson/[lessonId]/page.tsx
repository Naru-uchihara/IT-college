import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonViewer } from "@/components/lesson/lesson-viewer";
import { allLessons, getLessonById } from "@/data";

type PageProps = {
  params: Promise<{ lessonId: string }>;
};

export function generateStaticParams() {
  return allLessons.map((lesson) => ({ lessonId: lesson.id }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lessonId } = await params;
  const lesson = getLessonById(lessonId);
  return { title: lesson ? `${lesson.code} ${lesson.title}` : "レッスン" };
}

export default async function LessonPage({ params }: PageProps) {
  const { lessonId } = await params;
  const lesson = getLessonById(lessonId);
  if (!lesson) notFound();
  return <LessonViewer lesson={lesson} />;
}
