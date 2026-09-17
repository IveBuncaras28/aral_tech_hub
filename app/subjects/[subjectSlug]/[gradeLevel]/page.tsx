import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

interface PageProps {
  params: { subjectSlug: string; gradeLevel: string };
}

export async function generateStaticParams() {
  const grades = await prisma.gradeLevel.findMany({ include: { subject: true } });
  return grades.map((g) => ({
    subjectSlug: g.subject.slug,
    gradeLevel: String(g.gradeNumber),
  }));
}

export default async function GradeLevelPage({ params }: PageProps) {
  const grade = await prisma.gradeLevel.findFirst({
    where: {
      gradeNumber: Number(params.gradeLevel),
      subject: { slug: params.subjectSlug },
    },
    include: {
      subject: true,
      terms: {
        orderBy: { termNumber: "asc" },
        include: { topics: { select: { id: true } } },
      },
    },
  });

  if (!grade) notFound();

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/subjects" className="hover:underline">Subjects</Link> /{" "}
        <Link href={`/subjects/${grade.subject.slug}`} className="hover:underline">{grade.subject.name}</Link> /{" "}
        Grade {grade.gradeNumber}
      </nav>

      <h1 className="text-3xl font-bold mb-8">
        {grade.subject.name} — Grade {grade.gradeNumber}
      </h1>

      <div className="grid sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((termNumber) => {
          const term = grade.terms.find((t) => t.termNumber === termNumber);
          const topicCount = term?.topics.length ?? 0;

          if (!term) {
            return (
              <div key={termNumber} className="border rounded-lg p-4 text-center text-gray-300">
                <p className="text-lg font-semibold">Term {termNumber}</p>
                <p className="text-xs mt-1">Coming soon</p>
              </div>
            );
          }

          return (
            <Link
              key={termNumber}
              href={`/subjects/${grade.subject.slug}/${grade.gradeNumber}/${termNumber}`}
              className="block border rounded-lg p-4 text-center hover:border-blue-500 hover:shadow-sm transition"
            >
              <p className="text-lg font-semibold">Term {termNumber}</p>
              <p className="text-xs text-gray-400 mt-1">
                {topicCount} topic{topicCount !== 1 ? "s" : ""}
              </p>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
