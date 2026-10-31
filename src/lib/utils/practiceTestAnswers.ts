import { PRACTICE_TEST_ANSWERS_KEY_PREFIX } from "@/constants/storage";

function answersStorageKey(attemptId: number) {
  return `${PRACTICE_TEST_ANSWERS_KEY_PREFIX}${attemptId}`;
}

// Answers survive a reload while the attempt is still running.
export function readStoredAnswers(attemptId: number): Record<number, string> {
  try {
    const value = JSON.parse(
      window.localStorage.getItem(answersStorageKey(attemptId)) ?? "{}",
    ) as unknown;
    return value && typeof value === "object"
      ? (value as Record<number, string>)
      : {};
  } catch {
    return {};
  }
}

export function writeStoredAnswers(attemptId: number, answers: Record<number, string> | null) {
  try {
    if (answers) {
      window.localStorage.setItem(answersStorageKey(attemptId), JSON.stringify(answers));
    } else {
      window.localStorage.removeItem(answersStorageKey(attemptId));
    }
  } catch {
    // Storage can be unavailable; answers then live in memory only.
  }
}
