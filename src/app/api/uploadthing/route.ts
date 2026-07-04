// src/app/api/uploadthing/route.ts

import { createRouteHandler } from "uploadthing/next";
import { docWakaFileRouter } from "@/lib/uploadthing";

/**
 * UploadThing route handler.
 * Exposes GET and POST for UploadThing's internal handshake and upload flow.
 * File upload auth is enforced in the middleware defined in lib/uploadthing.ts.
 */
export const { GET, POST } = createRouteHandler({
  router: docWakaFileRouter,
});
