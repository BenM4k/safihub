import { inngest } from "../client";
import { pruneExpiredPhotosService } from "@/services/storage";

export const pruneExpiredPhotos = inngest.createFunction(
  {
    id: "prune-expired-photos",
    triggers: [{ cron: "0 3 * * 0" }], // Runs weekly on Sunday at 03:00 UTC per 90-day retention schedule
  },
  async ({ step }) => {
    return await step.run("prune-expired-photos-step", async () => {
      const result = await pruneExpiredPhotosService();
      if (!result.ok) {
        throw new Error(result.error);
      }
      return result.value;
    });
  }
);
