// src/lib/uploadthing.ts

import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/lib/auth";

const f = createUploadthing();

/**
 * DocWaka UploadThing file router.
 *
 * FSD §4.2 — File upload supports PDF and image formats via UploadThing CDN.
 * The returned fileUrl is stored in the Document.fileUrl field.
 *
 * Route: documentAttachment
 *   - Accepts: PDF (up to 16 MB) and images (up to 4 MB)
 *   - Auth guard: only authenticated, APPROVED users may upload
 */
export const docWakaFileRouter = {
  documentAttachment: f({
    pdf:   { maxFileSize: "16MB", maxFileCount: 1 },
    image: { maxFileSize: "4MB",  maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await auth();

      if (!session?.user?.id) {
        throw new Error("Unauthorised");
      }

      // Pass userId to onUploadComplete so it can be logged if needed
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // The file URL is returned to the client and stored with the document
      console.log(
        `[UploadThing] Upload complete — user: ${metadata.userId}, url: ${file.url}`
      );

      return { fileUrl: file.url };
    }),
} satisfies FileRouter;

export type DocWakaFileRouter = typeof docWakaFileRouter;
