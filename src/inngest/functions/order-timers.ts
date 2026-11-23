import { inngest } from "../client";
import {
  processAcceptanceTimersService,
  processReceptionConformingTimersService,
} from "@/services/order";

export const processOrderAcceptanceTimers = inngest.createFunction(
  {
    id: "process-order-acceptance-timers",
    triggers: [{ cron: "*/10 * * * *" }],
  },
  async ({ step }) => {
    return await step.run("process-acceptance-timers-step", async () => {
      const result = await processAcceptanceTimersService();
      if (!result.ok) {
        throw new Error(result.error);
      }
      return result.value;
    });
  },
);

export const processReceptionConformingTimers = inngest.createFunction(
  {
    id: "process-reception-conforming-timers",
    triggers: [{ cron: "*/10 * * * *" }],
  },
  async ({ step }) => {
    return await step.run(
      "process-reception-conforming-timers-step",
      async () => {
        const result = await processReceptionConformingTimersService();
        if (!result.ok) {
          throw new Error(result.error);
        }
        return result.value;
      },
    );
  },
);
