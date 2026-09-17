import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Browse Subjects | AralTech Hub",
  description: "Free K-12 reviewers for Filipino students, organized by subject and grade level.",
};

export default async function SubjectsPage() {
  const subjects = await prisma.subject.findMany({
    orderBy: { name: "asc" },
    include: { gradeLevels: { select: { gradeNumber: true } } },
  });

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Browse Subjects</h1>
      <p className="text-gray-500 mb-8">Pick a subject to see available grade levels and reviewers.</p>

      <div className="grid sm:grid-cols-2 gap-4">
        {subjects.map((subject) => {
          const grades = subject.gradeLevels.map((g) => g.gradeNumber).sort((a, b) => a - b);
          return (
            <Link
              key={subject.id}
              href={`/subjects/${subject.slug}`}
              className="block border rounded-lg p-4 hover:border-blue-500 hover:shadow-sm transition"
            >
              <h2 className="text-lg font-semibold">{subject.name}</h2>
              {subject.description && (
                <p className="text-sm text-gray-500 mt-1">{subject.description}</p>
              )}
              {grades.length > 0 && (
                <p className="text-xs text-gray-400 mt-2">
                  Grades: {grades.join(", ")}
                </p>
              )}
            </Link>
          );
        })}
      </div>

      {subjects.length === 0 && (
        <p className="text-gray-400">No subjects added yet — run the seed script to get started.</p>
      )}
    </main>
  );
}
