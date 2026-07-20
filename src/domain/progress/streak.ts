/**
 * 連続学習日数(純粋関数)。
 * studyDates は "YYYY-MM-DD" 形式の重複なし配列を想定する。
 */

/** ローカルタイムゾーンでの "YYYY-MM-DD" を返す */
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** 学習日を追加した新しい配列を返す(重複なし・昇順) */
export function addStudyDate(studyDates: string[], dateKey: string): string[] {
  if (studyDates.includes(dateKey)) return studyDates;
  return [...studyDates, dateKey].sort();
}

/**
 * 今日を基準にした連続学習日数。
 * 今日まだ学習していない場合は、昨日までの連続を返す
 * (今日学習すれば途切れないため)。
 */
export function computeStreak(studyDates: string[], today: Date): number {
  const dates = new Set(studyDates);
  const cursor = new Date(today);
  let streak = 0;
  if (!dates.has(toDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (dates.has(toDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
