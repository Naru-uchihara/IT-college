/**
 * 選択肢のランダム化。
 * 機械的な位置暗記を防ぐため、出題のたびに選択肢順を入れ替える。
 */
export function shuffle<T>(
  items: T[],
  random: () => number = Math.random,
): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
