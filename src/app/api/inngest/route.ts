import { serve } from "inngest/next";
import { inngest, pruneExpiredPhotos } from "@/inngest";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [pruneExpiredPhotos],
});
