import { serve } from "inngest/next";
import {
  dispatchEmailNotification,
  dispatchWhatsAppNotification,
  inngest,
  pruneExpiredPhotos,
} from "@/inngest";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    pruneExpiredPhotos,
    dispatchWhatsAppNotification,
    dispatchEmailNotification,
  ],
});
