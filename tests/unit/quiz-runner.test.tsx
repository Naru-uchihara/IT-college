import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QuizRunner } from "@/components/quiz/quiz-runner";
import { makeQuestion } from "./helpers";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("QuizRunner", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  const question = makeQuestion({
    id: "q-test-1",
    prompt: "テスト用の問題文",
    correctAnswer: "a",
  });

  it("選択肢を選ぶまで回答確定ボタンは押せない", async () => {
    render(
      <QuizRunner
        mode="lesson"
        lessonId="11-01"
        lessonQuestions={[question]}
      />,
    );

    const confirmButton = await screen.findByRole("button", {
      name: "回答を確定する",
    });
    expect(confirmButton).toBeDisabled();

    await userEvent.click(screen.getByRole("radio", { name: "選択肢A" }));
    expect(confirmButton).toBeEnabled();
  });

  it("正解すると正誤フィードバックと解説が表示される", async () => {
    render(
      <QuizRunner
        mode="lesson"
        lessonId="11-01"
        lessonQuestions={[question]}
      />,
    );

    await screen.findByText("テスト用の問題文");
    await userEvent.click(screen.getByRole("radio", { name: "選択肢A" }));
    await userEvent.click(
      screen.getByRole("button", { name: "回答を確定する" }),
    );

    expect(screen.getByText("正解です!")).toBeInTheDocument();
    expect(screen.getByText("テスト解説")).toBeInTheDocument();
    // 回答後は選択肢を変更できない
    expect(screen.getByRole("radio", { name: "選択肢A" })).toBeDisabled();
  });

  it("不正解だと復習キュー追加の案内が表示される", async () => {
    render(
      <QuizRunner
        mode="lesson"
        lessonId="11-01"
        lessonQuestions={[question]}
      />,
    );

    await screen.findByText("テスト用の問題文");
    await userEvent.click(screen.getByRole("radio", { name: "選択肢B" }));
    await userEvent.click(
      screen.getByRole("button", { name: "回答を確定する" }),
    );

    expect(
      screen.getByText(/不正解。正解は「選択肢A」です。/),
    ).toBeInTheDocument();
    expect(screen.getByText(/復習キューに追加されました/)).toBeInTheDocument();
  });
});
