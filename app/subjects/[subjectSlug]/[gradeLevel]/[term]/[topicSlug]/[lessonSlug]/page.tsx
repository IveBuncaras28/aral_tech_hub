import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import QuizBlock from "@/components/QuizBlock";
import MarkCompleteButton from "@/components/MarkCompleteButton";

interface PageProps {
  params: {
    subjectSlug: string;
    gradeLevel: string;
    term: string;
    topicSlug: string;
    lessonSlug: string;
  };
}

export async function generateStaticParams() {
  const lessons = await prisma.lesson.findMany({
    include: { topic: { include: { term: { include: { gradeLevel: { include: { subject: true } } } } } } },
  });

  return lessons.map((lesson) => ({
    subjectSlug: lesson.topic.term.gradeLevel.subject.slug,
    gradeLevel: String(lesson.topic.term.gradeLevel.gradeNumber),
    term: String(lesson.topic.term.termNumber),
    topicSlug: lesson.topic.slug,
    lessonSlug: lesson.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const lesson = await prisma.lesson.findFirst({
    where: { slug: params.lessonSlug },
    include: { topic: true },
  });

  if (!lesson) return {};

  return {
    title: `${lesson.title} | Grade ${params.gradeLevel} Reviewer | AralTech Hub`,
    description: `Free Grade ${params.gradeLevel} reviewer on ${lesson.title}, aligned with the DepEd curriculum (${lesson.topic.competencyCode ?? "see lesson"}).`,
  };
}

export default async function LessonPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  const lesson = await prisma.lesson.findFirst({
    where: {
      slug: params.lessonSlug,
      topic: {
        slug: params.topicSlug,
        term: {
          termNumber: Number(params.term),
          gradeLevel: {
            gradeNumber: Number(params.gradeLevel),
            subject: { slug: params.subjectSlug },
          },
        },
      },
    },
    include: {
      topic: { include: { term: { include: { gradeLevel: true } } } },
      quiz: { include: { questions: true } },
    },
  });

  if (!lesson) notFound();

  const userId = session?.user?.id;
  const isAdmin = session?.user?.role === "ADMIN";

  const existingProgress = userId
    ? await prisma.progress.findUnique({
        where: { userId_lessonId: { userId, lessonId: lesson.id } },
      })
    : null;

  const framework = lesson.topic.term.gradeLevel.framework;

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-4 flex justify-between items-center">
        <span>
          {params.subjectSlug} / Grade {params.gradeLevel} / Term {params.term} / {lesson.topic.title}
        </span>
        {isAdmin && (
          <Link href={`/admin/lessons/${lesson.id}/edit`} className="text-blue-600 hover:underline text-xs">
            Edit lesson
          </Link>
        )}
      </nav>

      <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
      <div className="flex gap-3 text-xs text-gray-400 mb-6">
        {lesson.topic.competencyCode && <span>Competency: {lesson.topic.competencyCode}</span>}
        <span>Curriculum: {framework}</span>
      </div>

      <article className="prose prose-slate max-w-none">
        <MDXRemote
          source={lesson.contentMdx}
          options={{ mdxOptions: { remarkPlugins: [remarkMath], rehypePlugins: [rehypeKatex] } }}
        />
      </article>

      <div className="mt-6">
        <MarkCompleteButton lessonId={lesson.id} initiallyCompleted={!!existingProgress} />
      </div>

      {lesson.quiz && <QuizBlock quiz={lesson.quiz} />}
    </main>
  );
}
