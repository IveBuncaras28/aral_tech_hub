import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createGradeLevel } from "@/lib/actions/admin";

export default async function AdminSubjectPage({ params }: { params: { subjectId: string } }) {
  const subject = await prisma.subject.findUnique({
    where: { id: params.subjectId },
    include: { gradeLevels: { orderBy: { gradeNumber: "asc" } } },
  });

  if (!subject) notFound();

  const createGradeLevelForSubject = createGradeLevel.bind(null, subject.id);

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/admin" className="hover:underline">Admin</Link> / {subject.name}
      </nav>

      <h1 className="text-2xl font-bold mb-6">{subject.name} — Grade Levels</h1>

      <div className="space-y-2 mb-8">
        {subject.gradeLevels.map((g) => (
          <Link
            key={g.id}
            href={`/admin/subjects/${subject.id}/grades/${g.id}`}
            className="block border rounded p-3 hover:border-blue-500"
          >
            Grade {g.gradeNumber} — {g.framework}
            {g.shsTrack ? ` (${g.shsTrack})` : ""}
          </Link>
        ))}
        {subject.gradeLevels.length === 0 && (
          <p className="text-gray-400">No grade levels yet — add one below.</p>
        )}
      </div>

      <form action={createGradeLevelForSubject} className="border rounded p-4 space-y-3">
        <h2 className="font-semibold">Add a grade level</h2>

        <label className="block text-sm">
          Grade number (1-12)
          <input
            name="gradeNumber"
            type="number"
            min={1}
            max={12}
            required
            className="w-full border rounded px-3 py-2 mt-1"
          />
        </label>

        <label className="block text-sm">
          Curriculum framework
          <select name="framework" required className="w-full border rounded px-3 py-2 mt-1">
            <option value="MELC">MELC (not yet on MATATAG this year)</option>
            <option value="MATATAG">MATATAG (Grades 3, 6, 9 this year)</option>
            <option value="SHS_STRENGTHENED">Strengthened SHS (Grade 11+)</option>
            <option value="SHS_LEGACY">SHS Legacy (Grade 12 this year)</option>
          </select>
        </label>

        <label className="block text-sm">
          SHS Track (leave blank for K-10)
          <select name="shsTrack" className="w-full border rounded px-3 py-2 mt-1">
            <option value="">N/A</option>
            <option value="ACADEMIC">Academic</option>
            <option value="TECHPRO">TechPro</option>
          </select>
        </label>

        <p className="text-xs text-gray-400">
          Creating a grade level automatically sets up its 3 terms (per DepEd's SY 2026-2027 three-term calendar).
        </p>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Add Grade Level
        </button>
      </form>
    </main>
  );
}
