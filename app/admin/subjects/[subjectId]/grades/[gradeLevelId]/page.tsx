import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createTopic } from "@/lib/actions/admin";

export default async function AdminGradeLevelPage({
  params,
}: {
  params: { subjectId: string; gradeLevelId: string };
}) {
  const grade = await prisma.gradeLevel.findUnique({
    where: { id: Number(params.gradeLevelId) },
    include: {
      subject: true,
      terms: {
        orderBy: { termNumber: "asc" },
        include: { topics: { orderBy: { order: "asc" }, include: { lessons: true } } },
      },
    },
  });

  if (!grade) notFound();

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/admin" className="hover:underline">Admin</Link> /{" "}
        <Link href={`/admin/subjects/${params.subjectId}`} className="hover:underline">
          {grade.subject.name}
        </Link>{" "}
        / Grade {grade.gradeNumber}
      </nav>

      <h1 className="text-2xl font-bold mb-8">
        {grade.subject.name} — Grade {grade.gradeNumber}
      </h1>

      <div className="space-y-8">
        {grade.terms.map((term) => {
          const addTopicToTerm = createTopic.bind(null, term.id, params.subjectId);
          return (
            <div key={term.id} className="border rounded p-4">
              <h2 className="font-semibold mb-3">Term {term.termNumber}</h2>

              <ul className="space-y-1 mb-4">
                {term.topics.map((topic) => (
                  <li key={topic.id}>
                    <Link
                      href={`/admin/topics/${topic.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {topic.title}
                    </Link>{" "}
                    <span className="text-xs text-gray-400">
                      ({topic.lessons.length} lesson{topic.lessons.length !== 1 ? "s" : ""})
                    </span>
                  </li>
                ))}
                {term.topics.length === 0 && (
                  <li className="text-sm text-gray-400">No topics yet.</li>
                )}
              </ul>

              <form action={addTopicToTerm} className="flex gap-2">
                <input
                  name="title"
                  placeholder="Topic title, e.g. Sets"
                  required
                  className="flex-1 border rounded px-3 py-1.5 text-sm"
                />
                <input
                  name="competencyCode"
                  placeholder="Competency code (optional)"
                  className="w-48 border rounded px-3 py-1.5 text-sm"
                />
                <button type="submit" className="bg-gray-900 text-white px-3 py-1.5 rounded text-sm hover:bg-gray-800">
                  Add Topic
                </button>
              </form>
            </div>
          );
        })}
      </div>
    </main>
  );
}
