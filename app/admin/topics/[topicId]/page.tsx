import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createLesson, deleteLesson } from "@/lib/actions/admin";

export default async function AdminTopicPage({ params }: { params: { topicId: string } }) {
  const topic = await prisma.topic.findUnique({
    where: { id: params.topicId },
    include: {
      lessons: { orderBy: { order: "asc" } },
      term: { include: { gradeLevel: { include: { subject: true } } } },
    },
  });

  if (!topic) notFound();

  const { gradeLevel } = topic.term;
  const addLesson = createLesson.bind(null, topic.id);

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/admin" className="hover:underline">Admin</Link> /{" "}
        <Link href={`/admin/subjects/${gradeLevel.subjectId}`} className="hover:underline">
          {gradeLevel.subject.name}
        </Link>{" "}
        /{" "}
        <Link href={`/admin/subjects/${gradeLevel.subjectId}/grades/${gradeLevel.id}`} className="hover:underline">
          Grade {gradeLevel.gradeNumber}
        </Link>{" "}
        / {topic.title}
      </nav>

      <h1 className="text-2xl font-bold mb-6">{topic.title}</h1>

      <div className="space-y-2 mb-8">
        {topic.lessons.map((lesson) => (
          <div key={lesson.id} className="flex items-center justify-between border rounded p-3">
            <Link href={`/admin/lessons/${lesson.id}/edit`} className="text-blue-600 hover:underline">
              {lesson.title}
            </Link>
            <form action={deleteLesson.bind(null, lesson.id, topic.id)}>
              <button type="submit" className="text-xs text-red-500 hover:underline">
                Delete
              </button>
            </form>
          </div>
        ))}
        {topic.lessons.length === 0 && <p className="text-gray-400">No lessons yet — add one below.</p>}
      </div>

      <form action={addLesson} className="border rounded p-4 flex gap-2">
        <input
          name="title"
          placeholder="Lesson title, e.g. Introduction to Sets"
          required
          className="flex-1 border rounded px-3 py-2"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Create & Edit
        </button>
      </form>
    </main>
  );
}
