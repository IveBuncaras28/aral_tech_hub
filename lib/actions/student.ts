"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function markLessonComplete(lessonId: string, lessonPath: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { ok: false, reason: "not-logged-in" as const };

  await prisma.progress.upsert({
    where: { userId_lessonId: { userId: session.user.id, lessonId } },
    update: {},
    create: { userId: session.user.id, lessonId },
  });

  revalidatePath(lessonPath);
  return { ok: true as const };
}

export async function recordQuizAttempt(quizId: string, score: number, totalItems: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { ok: false, reason: "not-logged-in" as const };

  await prisma.quizAttempt.create({
    data: { userId: session.user.id, quizId, score, totalItems },
  });

  revalidatePath("/account/progress");
  return { ok: true as const };
}
