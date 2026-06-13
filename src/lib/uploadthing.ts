import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getCurrentUser } from "./auth";

const f = createUploadthing();

export const ourFileRouter = {
  orderDeliverable: f({
    image: { maxFileSize: "16MB", maxFileCount: 5 },
    pdf: { maxFileSize: "32MB", maxFileCount: 3 },
    "application/zip": { maxFileSize: "64MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const user = await getCurrentUser();
      if (!user) throw new Error("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
