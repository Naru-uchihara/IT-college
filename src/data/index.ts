import type { Chapter, Course, Lesson, Question } from "@/types";
import { chapters, courses } from "./curriculum";
import { ch11Lessons } from "./lessons/ch11";
import { ch13Lessons } from "./lessons/ch13";
import { ch14Lessons } from "./lessons/ch14";
import { ch11Questions } from "./questions/ch11";
import { ch13Questions } from "./questions/ch13";
import { ch14Questions } from "./questions/ch14";

/**
 * 教材データへのアクセサ。
 * UIコンポーネントはこのモジュール経由でのみ教材データへアクセスする。
 */

export const allCourses: Course[] = [...courses].sort(
  (a, b) => a.order - b.order,
);

export const allChapters: Chapter[] = [...chapters].sort(
  (a, b) => a.order - b.order,
);

export const allLessons: Lesson[] = [
  ...ch11Lessons,
  ...ch13Lessons,
  ...ch14Lessons,
].sort((a, b) => a.order - b.order);

export const allQuestions: Question[] = [
  ...ch11Questions,
  ...ch13Questions,
  ...ch14Questions,
].filter((q) => q.published);

const lessonById = new Map(allLessons.map((lesson) => [lesson.id, lesson]));
const questionById = new Map(allQuestions.map((q) => [q.id, q]));
const chapterById = new Map(allChapters.map((c) => [c.id, c]));
const courseById = new Map(allCourses.map((c) => [c.id, c]));

export function getLessonById(lessonId: string): Lesson | undefined {
  return lessonById.get(lessonId);
}

export function getQuestionById(questionId: string): Question | undefined {
  return questionById.get(questionId);
}

export function getChapterById(chapterId: string): Chapter | undefined {
  return chapterById.get(chapterId);
}

export function getCourseById(courseId: string): Course | undefined {
  return courseById.get(courseId);
}

export function getQuestionsForLesson(lessonId: string): Question[] {
  const lesson = lessonById.get(lessonId);
  if (!lesson) return [];
  return lesson.questionIds
    .map((id) => questionById.get(id))
    .filter((q): q is Question => q !== undefined);
}

export function getRequiredQuestionIds(lessonId: string): string[] {
  return getQuestionsForLesson(lessonId)
    .filter((q) => q.isRequired)
    .map((q) => q.id);
}

export function getLessonsForChapter(chapterId: string): Lesson[] {
  return allLessons.filter((lesson) => lesson.chapterId === chapterId);
}

/** 学習パス上の次のレッスン(orderで次) */
export function getNextLesson(lessonId: string): Lesson | undefined {
  const lesson = lessonById.get(lessonId);
  if (!lesson) return undefined;
  return allLessons.find((l) => l.order === lesson.order + 1);
}
