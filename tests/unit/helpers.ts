import type {
  Lesson,
  LessonProgress,
  Question,
  QuestionProgress,
} from "@/types";

export function makeQuestion(overrides: Partial<Question> = {}): Question {
  return {
    id: "q-1",
    courseId: "technology",
    chapterId: "ch11",
    lessonId: "11-01",
    type: "multiple_choice",
    difficulty: "beginner",
    prompt: "テスト問題",
    choices: [
      { id: "a", text: "選択肢A" },
      { id: "b", text: "選択肢B" },
      { id: "c", text: "選択肢C" },
      { id: "d", text: "選択肢D" },
    ],
    correctAnswer: "a",
    explanation: "テスト解説",
    relatedTerms: [],
    isRequired: true,
    sourceType: "original",
    published: true,
    ...overrides,
  };
}

export function makeLesson(overrides: Partial<Lesson> = {}): Lesson {
  return {
    id: "11-01",
    courseId: "technology",
    chapterId: "ch11",
    code: "11-01",
    title: "テストレッスン",
    summary: "テスト",
    learningObjectives: [],
    cards: [],
    questionIds: ["q-1", "q-2"],
    order: 1,
    ...overrides,
  };
}

export function makeLessonProgress(
  overrides: Partial<LessonProgress> = {},
): LessonProgress {
  return {
    status: "available",
    requiredQuestionIds: ["q-1", "q-2"],
    correctlyAnsweredRequiredQuestionIds: [],
    ...overrides,
  };
}

export function makeQuestionProgress(
  overrides: Partial<QuestionProgress> = {},
): QuestionProgress {
  return {
    attempts: 0,
    correctCount: 0,
    incorrectCount: 0,
    consecutiveCorrect: 0,
    ...overrides,
  };
}
