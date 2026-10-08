import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/utils";
import { saveUpload } from "@/lib/uploads";

export async function POST(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me) return jsonError("Unauthorized", 401);

  const form = await req.formData().catch(() => null);
  const file = form?.get("avatar");
  if (!file || !(file instanceof File) || file.size === 0) return jsonError("No file provided", 400);
  if (file.size > 3 * 1024 * 1024) return jsonError("File too large (max 3MB)", 400);

  const ext = (file.name.split(".").pop() || "").toLowerCase();
  if (!["png", "jpg", "jpeg", "webp"].includes(ext)) return jsonError("Only PNG, JPG or WEBP allowed", 400);

  const saved = await saveUpload(file, "avatar");

  const user = await prisma.user.update({
    where: { id: me.id },
    data: { avatarUrl: saved.fileUrl },
  });

  return jsonOk({ avatarUrl: user.avatarUrl });
}
