"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Server actions can be called directly, bypassing middleware, so every one
// of these re-checks the session role itself rather than trusting the route
// was reached through /admin.
async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "ADMIN") {
    throw new Error("Not authorized");
  }
  return session;
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// --- Subjects ---

export async function createSubject(formData: FormData) {
  await requireAdmin();
  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;

  await prisma.subject.create({
    data: { name, slug: slugify(name), description },
  });

  revalidatePath("/admin");
}

// --- Grade levels ---

export async function createGradeLevel(subjectId: string, formData: FormData) {
  await requireAdmin();
  const gradeNumber = Number(formData.get("gradeNumber"));
  const framework = formData.get("framework") as
    | "MATATAG"
    | "MELC"
    | "SHS_STRENGTHENED"
    | "SHS_LEGACY";
  const shsTrackRaw = formData.get("shsTrack") as string;
  const shsTrack = shsTrackRaw === "" ? null : (shsTrackRaw as "ACADEMIC" | "TECHPRO");

  const grade = await prisma.gradeLevel.create({
    data: { subjectId, gradeNumber, framework, shsTrack },
  });

  // Pre-create all 3 terms up front so the admin doesn't have to remember to —
  // matches DepEd's 3-term calendar for SY 2026-2027 onward.
  await prisma.term.createMany({
    data: [1, 2, 3].map((termNumber) => ({ gradeLevelId: grade.id, termNumber })),
  });

  revalidatePath(`/admin/subjects/${subjectId}`);
}

// --- Topics ---

export async function createTopic(termId: string, redirectSubjectId: string, formData: FormData) {
  await requireAdmin();
  const title = formData.get("title") as string;
  const competencyCode = (formData.get("competencyCode") as string) || null;

  await prisma.topic.create({
    data: { termId, title, slug: slugify(title), competencyCode },
  });

  revalidatePath(`/admin/subjects/${redirectSubjectId}`);
}

// --- Lessons ---

export async function createLesson(topicId: string, formData: FormData) {
  await requireAdmin();
  const title = formData.get("title") as string;

  const lesson = await prisma.lesson.create({
    data: {
      topicId,
      title,
      slug: slugify(title),
      contentMdx: "Start writing your lesson here...",
    },
  });

  redirect(`/admin/lessons/${lesson.id}/edit`);
}

export async function updateLessonContent(lessonId: string, formData: FormData) {
  await requireAdmin();
  const title = formData.get("title") as string;
  const contentMdx = formData.get("contentMdx") as string;

  const lesson = await prisma.lesson.update({
    where: { id: lessonId },
    data: { title, contentMdx },
    include: { topic: { include: { term: { include: { gradeLevel: { include: { subject: true } } } } } } },
  });

  const t = lesson.topic.term;
  const gl = t.gradeLevel;
  revalidatePath(
    `/subjects/${gl.subject.slug}/${gl.gradeNumber}/${t.termNumber}/${lesson.topic.slug}/${lesson.slug}`
  );
  revalidatePath(`/admin/lessons/${lessonId}/edit`);
}

export async function deleteLesson(lessonId: string, topicId: string) {
  await requireAdmin();
  await prisma.lesson.delete({ where: { id: lessonId } });
  revalidatePath(`/admin/topics/${topicId}`);
  redirect(`/admin/topics/${topicId}`);
}

// --- Quiz + questions ---

export async function upsertQuiz(lessonId: string, formData: FormData) {
  await requireAdmin();
  const title = (formData.get("quizTitle") as string) || "Quick Check";

  await prisma.quiz.upsert({
    where: { lessonId },
    update: { title },
    create: { lessonId, title },
  });

  revalidatePath(`/admin/lessons/${lessonId}/edit`);
}

export async function addQuestion(quizId: string, lessonId: string, formData: FormData) {
  await requireAdmin();
  const prompt = formData.get("prompt") as string;
  const choiceA = formData.get("choiceA") as string;
  const choiceB = formData.get("choiceB") as string;
  const choiceC = formData.get("choiceC") as string;
  const choiceD = formData.get("choiceD") as string;
  const correctAnswer = formData.get("correctAnswer") as string; // "A" | "B" | "C" | "D"
  const explanation = (formData.get("explanation") as string) || null;

  const existingCount = await prisma.question.count({ where: { quizId } });

  await prisma.question.create({
    data: {
      quizId,
      prompt,
      choices: [`A. ${choiceA}`, `B. ${choiceB}`, `C. ${choiceC}`, `D. ${choiceD}`],
      correctAnswer,
      explanation,
      order: existingCount + 1,
    },
  });

  revalidatePath(`/admin/lessons/${lessonId}/edit`);
}

export async function deleteQuestion(questionId: string, lessonId: string) {
  await requireAdmin();
  await prisma.question.delete({ where: { id: questionId } });
  revalidatePath(`/admin/lessons/${lessonId}/edit`);
}
