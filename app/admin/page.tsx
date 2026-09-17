import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createSubject } from "@/lib/actions/admin";

export default async function AdminDashboard() {
  const subjects = await prisma.subject.findMany({
    orderBy: { name: "asc" },
    include: { gradeLevels: true },
  });

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Admin — Subjects</h1>

      <div className="space-y-2 mb-8">
        {subjects.map((s) => (
          <Link
            key={s.id}
            href={`/admin/subjects/${s.id}`}
            className="block border rounded p-3 hover:border-blue-500"
          >
            <span className="font-medium">{s.name}</span>{" "}
            <span className="text-xs text-gray-400">
              ({s.gradeLevels.length} grade level{s.gradeLevels.length !== 1 ? "s" : ""})
            </span>
          </Link>
        ))}
        {subjects.length === 0 && <p className="text-gray-400">No subjects yet — add one below.</p>}
      </div>

      <form action={createSubject} className="border rounded p-4 space-y-3">
        <h2 className="font-semibold">Add a new subject</h2>
        <input
          name="name"
          placeholder="e.g. Science"
          required
          className="w-full border rounded px-3 py-2"
        />
        <textarea
          name="description"
          placeholder="Optional short description"
          className="w-full border rounded px-3 py-2"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Add Subject
        </button>
      </form>
    </main>
  );
}
