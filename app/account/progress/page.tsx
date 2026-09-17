import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ProgressPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10">
        <p>Please sign in to see your progress.</p>
      </main>
    );
  }

  const [progress, attempts] = await Promise.all([
    prisma.progress.findMany({
      where: { userId: session.user.id },
      orderBy: { completedAt: "desc" },
      include: {
        lesson: {
          include: { topic: { include: { term: { include: { gradeLevel: { include: { subject: true } } } } } } },
        },
      },
    }),
    prisma.quizAttempt.findMany({
      where: { userId: session.user.id },
      orderBy: { attemptedAt: "desc" },
      include: { quiz: { include: { lesson: true } } },
    }),
  ]);

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-8">My Progress</h1>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-3">Completed Lessons ({progress.length})</h2>
        <div className="space-y-2">
          {progress.map((p) => {
            const gl = p.lesson.topic.term.gradeLevel;
            const href = `/subjects/${gl.subject.slug}/${gl.gradeNumber}/${p.lesson.topic.term.termNumber}/${p.lesson.topic.slug}/${p.lesson.slug}`;
            return (
              <Link key={p.id} href={href} className="block border rounded p-3 hover:border-blue-500">
                <p className="font-medium">{p.lesson.title}</p>
                <p className="text-xs text-gray-400">
                  {gl.subject.name} — Grade {gl.gradeNumber} · Completed{" "}
                  {new Date(p.completedAt).toLocaleDateString()}
                </p>
              </Link>
            );
          })}
          {progress.length === 0 && (
            <p className="text-gray-400 text-sm">
              No lessons completed yet — head to <Link href="/subjects" className="text-blue-600 hover:underline">Subjects</Link> to get started.
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Quiz History ({attempts.length})</h2>
        <div className="space-y-2">
          {attempts.map((a) => (
            <div key={a.id} className="border rounded p-3 flex justify-between items-center">
              <div>
                <p className="font-medium">{a.quiz.lesson.title}</p>
                <p className="text-xs text-gray-400">{new Date(a.attemptedAt).toLocaleString()}</p>
              </div>
              <p className="font-semibold">
                {a.score} / {a.totalItems}
              </p>
            </div>
          ))}
          {attempts.length === 0 && <p className="text-gray-400 text-sm">No quiz attempts recorded yet.</p>}
        </div>
      </section>
    </main>
  );
}
