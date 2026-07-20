"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, CircleX, X } from "lucide-react";
import { ProgressBar } from "@/components/ui/progress-bar";
import { allQuestions, getQuestionById } from "@/data";
import { buildReviewQueue } from "@/domain/progress/review";
import { remainingRequiredQuestionIds } from "@/domain/progress/unlock";
import { shuffle } from "@/domain/quiz/shuffle";
import { useProgress } from "@/hooks/use-progress";
import type { Choice, Question, QuizAnswer, QuizMode } from "@/types";

type QuizItem = {
  question: Question;
  choices: Choice[];
};

type QuizRunnerProps = {
  mode: QuizMode;
  /** lesson モードのときの対象レッスンID */
  lessonId?: string;
  /** review モードの絞り込み */
  filter?: { chapterId?: string; lessonId?: string };
  /** lesson モードで出題する問題(ページ側で確定) */
  lessonQuestions?: Question[];
};

function toItems(questions: Question[]): QuizItem[] {
  return questions.map((question) => ({
    question,
    choices: shuffle(question.choices ?? []),
  }));
}

/**
 * クイズの入口。進捗の読み込みを待ってから、
 * 出題リストを確定して QuizSession を開始する。
 */
export function QuizRunner({
  mode,
  lessonId,
  filter,
  lessonQuestions,
}: QuizRunnerProps) {
  const { ready, progress } = useProgress();

  if (!ready || !progress) {
    return (
      <p role="status" className="py-12 text-center text-slate-500">
        読み込み中...
      </p>
    );
  }

  const questions =
    mode === "lesson"
      ? (lessonQuestions ?? [])
      : buildReviewQueue(allQuestions, progress.questionProgress, filter).map(
          (item) => item.question,
        );

  if (questions.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-slate-600">
          {mode === "review"
            ? "復習する問題はありません。間違えた問題がここに追加されます。"
            : "このレッスンには問題がありません。"}
        </p>
        <Link
          href={mode === "review" ? "/review" : "/learn"}
          className="mt-4 inline-block rounded-xl bg-teal-600 px-5 py-2.5 font-bold text-white hover:bg-teal-700"
        >
          戻る
        </Link>
      </div>
    );
  }

  return <QuizSession mode={mode} lessonId={lessonId} questions={questions} />;
}

type QuizSessionProps = {
  mode: QuizMode;
  lessonId?: string;
  questions: Question[];
};

/** クイズ本体: 出題 → 回答確定 → 正誤と解説 → 次へ */
function QuizSession({ mode, lessonId, questions }: QuizSessionProps) {
  const router = useRouter();
  const { progress, service } = useProgress();

  // 出題リストと選択肢の順序はセッション開始時に一度だけ確定する
  const [items, setItems] = useState<QuizItem[]>(() => toItems(questions));
  const [itemIndex, setItemIndex] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [phase, setPhase] = useState<"answering" | "feedback" | "retry_offer">(
    "answering",
  );
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [startedAt] = useState(() => new Date().toISOString());

  if (!progress || !service) return null;

  const finishQuiz = (finalAnswers: QuizAnswer[]) => {
    const attempt = service.completeAttempt({
      lessonId: lessonId ?? "review",
      mode,
      startedAt,
      answers: finalAnswers,
    });
    router.push(`/result/${attempt.id}`);
  };

  const handleInterrupt = () => {
    const message =
      answers.length > 0
        ? "クイズを中断しますか?ここまでの回答は記録されます。"
        : "クイズを中断しますか?";
    if (!window.confirm(message)) return;
    if (answers.length > 0) {
      finishQuiz(answers);
    } else {
      router.push(mode === "review" ? "/review" : "/learn");
    }
  };

  // ---- 未正解の必須問題への再挑戦オファー ----
  if (phase === "retry_offer") {
    const remainingIds = lessonId
      ? remainingRequiredQuestionIds(progress.lessonProgress[lessonId])
      : [];
    const remainingQuestions = remainingIds
      .map((id) => getQuestionById(id))
      .filter((q): q is Question => q !== undefined);

    return (
      <div className="space-y-4 py-8 text-center">
        <h1 className="text-xl font-bold">あと少し!</h1>
        <p className="text-slate-600">
          まだ正解していない必須問題が {remainingQuestions.length} 問あります。
          <br />
          すべて正解すると次のステージが解放されます。
        </p>
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={() => {
              setItems(toItems(remainingQuestions));
              setItemIndex(0);
              setSelectedChoiceId(null);
              setPhase("answering");
            }}
            className="rounded-xl bg-teal-600 px-6 py-3 font-bold text-white hover:bg-teal-700"
          >
            未正解の問題に再挑戦する
          </button>
          <button
            onClick={() => finishQuiz(answers)}
            className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-medium text-slate-700 hover:bg-slate-50"
          >
            今回はここまでにして結果を見る
          </button>
        </div>
      </div>
    );
  }

  const item = items[itemIndex];
  const question = item.question;
  const isCorrect = selectedChoiceId === question.correctAnswer;
  const correctChoice = item.choices.find(
    (choice) => choice.id === question.correctAnswer,
  );

  const handleConfirm = () => {
    if (selectedChoiceId === null || phase !== "answering") return;
    const correct = selectedChoiceId === question.correctAnswer;
    service.recordAnswer(question, selectedChoiceId, correct, mode);
    setAnswers((prev) => [
      ...prev,
      {
        questionId: question.id,
        selectedAnswer: selectedChoiceId,
        isCorrect: correct,
        answeredAt: new Date().toISOString(),
      },
    ]);
    setPhase("feedback");
  };

  const handleNext = () => {
    const isLast = itemIndex === items.length - 1;
    if (!isLast) {
      setItemIndex((i) => i + 1);
      setSelectedChoiceId(null);
      setPhase("answering");
      return;
    }
    // 最後の問題: 必須問題の未正解が残っていれば再挑戦を提案する
    const latestProgress = service.getProgress();
    const remaining = lessonId
      ? remainingRequiredQuestionIds(latestProgress.lessonProgress[lessonId])
      : [];
    if (mode === "lesson" && remaining.length > 0) {
      setPhase("retry_offer");
    } else {
      finishQuiz(answers);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-600">
          {mode === "review" ? "復習" : "確認クイズ"} 問題 {itemIndex + 1} /{" "}
          {items.length}
        </p>
        <button
          onClick={handleInterrupt}
          className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
        >
          <X aria-hidden="true" className="h-4 w-4" />
          中断
        </button>
      </div>

      <ProgressBar
        value={itemIndex + (phase === "feedback" ? 1 : 0)}
        max={items.length}
        label="クイズの進捗"
      />

      <fieldset className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <legend className="sr-only">問題と選択肢</legend>
        <p className="font-medium leading-relaxed">{question.prompt}</p>

        <div role="radiogroup" aria-label="選択肢" className="mt-4 space-y-2">
          {item.choices.map((choice) => {
            const isSelected = selectedChoiceId === choice.id;
            const isAnswerChoice = choice.id === question.correctAnswer;
            const feedbackStyle =
              phase === "feedback"
                ? isAnswerChoice
                  ? "border-teal-600 bg-teal-50"
                  : isSelected
                    ? "border-rose-400 bg-rose-50"
                    : "border-slate-200 opacity-60"
                : isSelected
                  ? "border-teal-600 bg-teal-50 ring-1 ring-teal-600"
                  : "border-slate-300 hover:border-teal-400 hover:bg-slate-50";

            return (
              <button
                key={choice.id}
                role="radio"
                aria-checked={isSelected}
                disabled={phase === "feedback"}
                onClick={() => setSelectedChoiceId(choice.id)}
                className={`flex w-full items-start gap-2 rounded-xl border-2 px-4 py-3 text-left text-sm leading-relaxed disabled:cursor-default ${feedbackStyle}`}
              >
                {phase === "feedback" && isAnswerChoice && (
                  <CheckCircle2
                    aria-hidden="true"
                    className="mt-0.5 h-4 w-4 shrink-0 text-teal-600"
                  />
                )}
                {phase === "feedback" && isSelected && !isAnswerChoice && (
                  <CircleX
                    aria-hidden="true"
                    className="mt-0.5 h-4 w-4 shrink-0 text-rose-500"
                  />
                )}
                <span>{choice.text}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* 正誤フィードバック(スクリーンリーダーへ通知) */}
      <div aria-live="polite">
        {phase === "feedback" && (
          <div
            className={`rounded-2xl border-2 p-4 ${
              isCorrect
                ? "border-teal-500 bg-teal-50"
                : "border-rose-300 bg-rose-50"
            }`}
          >
            <p className="flex items-center gap-2 font-bold">
              {isCorrect ? (
                <>
                  <CheckCircle2
                    aria-hidden="true"
                    className="h-5 w-5 text-teal-600"
                  />
                  <span className="text-teal-800">正解です!</span>
                </>
              ) : (
                <>
                  <CircleX
                    aria-hidden="true"
                    className="h-5 w-5 text-rose-500"
                  />
                  <span className="text-rose-800">
                    不正解。正解は「{correctChoice?.text}」です。
                  </span>
                </>
              )}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              {question.explanation}
            </p>
            {!isCorrect &&
              selectedChoiceId &&
              question.incorrectExplanations?.[selectedChoiceId] && (
                <p className="mt-2 rounded-lg bg-white/70 p-2 text-sm text-slate-600">
                  <span className="font-bold">選んだ選択肢について: </span>
                  {question.incorrectExplanations[selectedChoiceId]}
                </p>
              )}
            {!isCorrect && (
              <p className="mt-2 text-xs text-slate-500">
                この問題は復習キューに追加されました。あとで何度でも挑戦できます。
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        {phase === "answering" ? (
          <button
            onClick={handleConfirm}
            disabled={selectedChoiceId === null}
            className="rounded-xl bg-teal-600 px-6 py-3 font-bold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            回答を確定する
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="rounded-xl bg-teal-600 px-6 py-3 font-bold text-white hover:bg-teal-700"
          >
            {itemIndex === items.length - 1 ? "結果へ進む" : "次の問題へ"}
          </button>
        )}
      </div>
    </div>
  );
}
