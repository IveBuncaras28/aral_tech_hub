import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

interface PageProps {
  params: { subjectSlug: string; gradeLevel: string; term: string };
}

export async function generateStaticParams() {
  const terms = await prisma.term.findMany({
    include: { gradeLevel: { include: { subject: true } } },
  });
  return terms.map((t) => ({
    subjectSlug: t.gradeLevel.subject.slug,
    gradeLevel: String(t.gradeLevel.gradeNumber),
    term: String(t.termNumber),
  }));
}

export default async function TermPage({ params }: PageProps) {
  const term = await prisma.term.findFirst({
    where: {
      termNumber: Number(params.term),
      gradeLevel: {
        gradeNumber: Number(params.gradeLevel),
        subject: { slug: params.subjectSlug },
      },
    },
    include: {
      gradeLevel: { include: { subject: true } },
      topics: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!term) notFound();

  const { subject } = term.gradeLevel;

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/subjects" className="hover:underline">Subjects</Link> /{" "}
        <Link href={`/subjects/${subject.slug}`} className="hover:underline">{subject.name}</Link> /{" "}
        <Link href={`/subjects/${subject.slug}/${term.gradeLevel.gradeNumber}`} className="hover:underline">
          Grade {term.gradeLevel.gradeNumber}
        </Link>{" "}
        / Term {term.termNumber}
      </nav>

      <h1 className="text-3xl font-bold mb-8">
        {subject.name} — Grade {term.gradeLevel.gradeNumber}, Term {term.termNumber}
      </h1>

      <div className="space-y-6">
        {term.topics.map((topic) => (
          <div key={topic.id} className="border rounded-lg p-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-semibold">{topic.title}</h2>
              {topic.competencyCode && (
                <span className="text-xs text-gray-400">{topic.competencyCode}</span>
              )}
            </div>
            <ul className="mt-3 space-y-1">
              {topic.lessons.map((lesson) => (
                <li key={lesson.id}>
                  <Link
                    href={`/subjects/${subject.slug}/${term.gradeLevel.gradeNumber}/${term.termNumber}/${topic.slug}/${lesson.slug}`}
                    className="text-blue-600 hover:underline"
                  >
                    {lesson.title}
                  </Link>
                </li>
              ))}
              {topic.lessons.length === 0 && (
                <li className="text-sm text-gray-300">No lessons added yet</li>
              )}
            </ul>
          </div>
        ))}

        {term.topics.length === 0 && (
          <p className="text-gray-400">No topics added for this term yet.</p>
        )}
      </div>
    </main>
  );
}
