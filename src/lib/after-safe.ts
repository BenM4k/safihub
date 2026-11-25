import "server-only";
import { after } from "next/server";

/**
 * Schedules a non-blocking background task via Next.js `after()` when inside a
 * request/action lifecycle, falling back to detached execution in unit tests.
 */
export function runAfterSafe(task: () => Promise<void> | void): void {
  try {
    after(async () => {
      try {
        await task();
      } catch (err) {
        console.error("[runAfterSafe] Background task failed:", err);
      }
    });
  } catch {
    void Promise.resolve()
      .then(task)
      .catch((err) => {
        console.error("[runAfterSafe] Detached task failed:", err);
      });
  }
}
