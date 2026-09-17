import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

interface PageProps {
  params: { subjectSlug: string };
}

export async function generateStaticParams() {
  const subjects = await prisma.subject.findMany({ select: { slug: true } });
  return subjects.map((s) => ({ subjectSlug: s.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const subject = await prisma.subject.findUnique({ where: { slug: params.subjectSlug } });
  if (!subject) return {};
  return {
    title: `${subject.name} Reviewers | AralTech Hub`,
    description: `Free ${subject.name} reviewers for K-12 students in the Philippines, by grade level.`,
  };
}

const FRAMEWORK_LABEL: Record<string, string> = {
  MATATAG: "MATATAG Curriculum",
  MELC: "MELC-based",
  SHS_STRENGTHENED: "Strengthened SHS Curriculum",
  SHS_LEGACY: "SHS (previous curriculum)",
};

export default async function SubjectPage({ params }: PageProps) {
  const subject = await prisma.subject.findUnique({
    where: { slug: params.subjectSlug },
    include: {
      gradeLevels: {
        orderBy: { gradeNumber: "asc" },
        include: { terms: { select: { id: true } } },
      },
    },
  });

  if (!subject) notFound();

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/subjects" className="hover:underline">Subjects</Link> / {subject.name}
      </nav>

      <h1 className="text-3xl font-bold mb-2">{subject.name}</h1>
      {subject.description && <p className="text-gray-500 mb-8">{subject.description}</p>}

      <div className="grid sm:grid-cols-3 gap-4">
        {subject.gradeLevels.map((grade) => (
          <Link
            key={grade.id}
            href={`/subjects/${subject.slug}/${grade.gradeNumber}`}
            className="block border rounded-lg p-4 text-center hover:border-blue-500 hover:shadow-sm transition"
          >
            <p className="text-xl font-semibold">Grade {grade.gradeNumber}</p>
            <p className="text-xs text-gray-400 mt-1">{FRAMEWORK_LABEL[grade.framework] ?? grade.framework}</p>
            {grade.shsTrack && (
              <p className="text-xs text-gray-400">{grade.shsTrack === "ACADEMIC" ? "Academic Track" : "TechPro Track"}</p>
            )}
            <p className="text-xs text-gray-300 mt-1">{grade.terms.length} term{grade.terms.length !== 1 ? "s" : ""} available</p>
          </Link>
        ))}
      </div>

      {subject.gradeLevels.length === 0 && (
        <p className="text-gray-400">No grade levels added for this subject yet.</p>
      )}
    </main>
  );
}
