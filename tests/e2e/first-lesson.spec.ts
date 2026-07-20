import { expect, test, type Page } from "@playwright/test";
import { ch11Lessons } from "../../src/data/lessons/ch11";
import { ch11Questions } from "../../src/data/questions/ch11";

/**
 * 受け入れ条件: 最初のレッスン(11-01)の学習カード → クイズ全問正解 →
 * ステージクリア → 次ステージ解放、までの一連のE2Eテスト。
 */

const firstLesson = ch11Lessons[0];

/** 出題中の問題に対する正解の選択肢テキストを返す */
function correctChoiceText(prompt: string): string {
  const question = ch11Questions.find((q) => prompt.includes(q.prompt));
  if (!question) throw new Error(`問題が見つかりません: ${prompt}`);
  const choice = question.choices?.find((c) => c.id === question.correctAnswer);
  if (!choice) throw new Error(`正解の選択肢がありません: ${question.id}`);
  return choice.text;
}

async function answerCurrentQuestionCorrectly(page: Page) {
  const prompt = await page.locator("fieldset p").first().innerText();
  await page.getByRole("radio", { name: correctChoiceText(prompt) }).click();
  await page.getByRole("button", { name: "回答を確定する" }).click();
  await expect(page.getByText("正解です!")).toBeVisible();
}

test("最初のレッスンを完了して次のステージが解放される", async ({ page }) => {
  // トップページから開始
  await page.goto("/");
  await expect(page.getByRole("link", { name: /続きから学ぶ/ })).toBeVisible();

  // 学習パス: 最初のステージだけが解放されている
  await page.goto("/learn");
  await expect(
    page.getByRole("link", {
      name: `11-01 ${firstLesson.title}(挑戦できます)`,
    }),
  ).toBeVisible();
  const lockedSecond = page.getByRole("button", {
    name: /11-02 .*(ロック中)/,
  });
  await expect(lockedSecond).toBeVisible();

  // ロック中ステージを押すと解放条件が説明される
  await lockedSecond.click();
  await expect(
    page.getByText(/必須問題をすべて正解するとクリア/),
  ).toBeVisible();

  // 最初のステージを開始
  await page
    .getByRole("link", { name: `11-01 ${firstLesson.title}(挑戦できます)` })
    .click();
  await expect(
    page.getByRole("heading", { name: firstLesson.title }),
  ).toBeVisible();

  // 学習カードを最後まで読む
  for (let i = 0; i < firstLesson.cards.length - 1; i += 1) {
    await page.getByRole("button", { name: "次へ" }).click();
  }

  // クイズ開始
  await page.getByRole("button", { name: "確認クイズを始める" }).click();
  await expect(page.getByText(/問題 1 \/ 5/)).toBeVisible();

  // 未選択では回答確定できない
  await expect(
    page.getByRole("button", { name: "回答を確定する" }),
  ).toBeDisabled();

  // 5問すべて正解する
  for (let i = 0; i < 5; i += 1) {
    await answerCurrentQuestionCorrectly(page);
    await page
      .getByRole("button", { name: i < 4 ? "次の問題へ" : "結果へ進む" })
      .click();
  }

  // 結果画面: ステージクリアと次ステージ解放
  await expect(page.getByText("ステージクリア!")).toBeVisible();
  await expect(page.getByText(/次のステージ「11-02/)).toBeVisible();
  await expect(page.getByText("100%")).toBeVisible();

  // 学習パスで 11-02 が解放されている
  await page.goto("/learn");
  await expect(
    page.getByRole("link", { name: /11-01 .*(クリア済み)/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /11-02 .*(挑戦できます)/ }),
  ).toBeVisible();

  // 再読み込みしても解放状態が維持される(localStorage永続化)
  await page.reload();
  await expect(
    page.getByRole("link", { name: /11-02 .*(挑戦できます)/ }),
  ).toBeVisible();
});

test("不正解の問題は復習キューに追加され、復習で再挑戦できる", async ({
  page,
}) => {
  // 11-01のクイズでわざと1問間違える
  await page.goto(`/quiz/${firstLesson.id}`);
  await expect(page.getByText(/問題 1 \/ 5/)).toBeVisible();

  const prompt = await page.locator("fieldset p").first().innerText();
  const question = ch11Questions.find((q) => prompt.includes(q.prompt));
  const wrongChoice = question?.choices?.find(
    (c) => c.id !== question.correctAnswer,
  );
  if (!wrongChoice) throw new Error("不正解の選択肢が見つかりません");

  await page.getByRole("radio", { name: wrongChoice.text }).click();
  await page.getByRole("button", { name: "回答を確定する" }).click();
  await expect(page.getByText(/不正解。正解は「/)).toBeVisible();
  await expect(page.getByText(/復習キューに追加されました/)).toBeVisible();

  // 中断して復習画面へ
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "中断" }).click();

  await page.goto("/review");
  await expect(page.getByText(/復習を始める/)).toBeVisible();
  await expect(page.getByText(question!.prompt)).toBeVisible();

  // 復習クイズで正解し直す
  await page.getByRole("link", { name: /復習を始める/ }).click();
  await page
    .getByRole("radio", { name: correctChoiceText(question!.prompt) })
    .click();
  await page.getByRole("button", { name: "回答を確定する" }).click();
  await expect(page.getByText("正解です!")).toBeVisible();
  await page.getByRole("button", { name: "結果へ進む" }).click();
  await expect(page.getByText("復習おつかれさまでした!")).toBeVisible();
});
