import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  updateLessonContent,
  upsertQuiz,
  addQuestion,
  deleteQuestion,
} from "@/lib/actions/admin";

export default async function EditLessonPage({ params }: { params: { lessonId: string } }) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: params.lessonId },
    include: {
      topic: { include: { term: { include: { gradeLevel: { include: { subject: true } } } } } },
      quiz: { include: { questions: { orderBy: { order: "asc" } } } },
    },
  });

  if (!lesson) notFound();

  const { gradeLevel } = lesson.topic.term;
  const previewUrl = `/subjects/${gradeLevel.subject.slug}/${gradeLevel.gradeNumber}/${lesson.topic.term.termNumber}/${lesson.topic.slug}/${lesson.slug}`;

  const saveLesson = updateLessonContent.bind(null, lesson.id);
  const saveQuiz = upsertQuiz.bind(null, lesson.id);

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <nav className="text-sm text-gray-500 mb-4 flex justify-between">
        <span>
          <Link href={`/admin/topics/${lesson.topicId}`} className="hover:underline">
            ← Back to {lesson.topic.title}
          </Link>
        </span>
        <Link href={previewUrl} target="_blank" className="text-blue-600 hover:underline">
          Preview live page ↗
        </Link>
      </nav>

      <h1 className="text-2xl font-bold mb-6">Edit Lesson</h1>

      <form action={saveLesson} className="space-y-3 mb-10">
        <label className="block text-sm">
          Title
          <input
            name="title"
            defaultValue={lesson.title}
            required
            className="w-full border rounded px-3 py-2 mt-1"
          />
        </label>

        <label className="block text-sm">
          Content (MDX — supports Markdown + LaTeX math via $...$ or $$...$$)
          <textarea
            name="contentMdx"
            defaultValue={lesson.contentMdx}
            required
            rows={16}
            className="w-full border rounded px-3 py-2 mt-1 font-mono text-sm"
          />
        </label>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Save Lesson
        </button>
      </form>

      <hr className="mb-8" />

      <h2 className="text-xl font-semibold mb-4">Quiz</h2>

      <form action={saveQuiz} className="flex gap-2 mb-6">
        <input
          name="quizTitle"
          defaultValue={lesson.quiz?.title ?? "Quick Check"}
          className="flex-1 border rounded px-3 py-2"
        />
        <button type="submit" className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800">
          {lesson.quiz ? "Update Quiz Title" : "Create Quiz"}
        </button>
      </form>

      {lesson.quiz && (
        <>
          <div className="space-y-3 mb-6">
            {lesson.quiz.questions.map((q, idx) => (
              <div key={q.id} className="border rounded p-3">
                <div className="flex justify-between items-start">
                  <p className="font-medium">
                    {idx + 1}. {q.prompt}
                  </p>
                  <form action={deleteQuestion.bind(null, q.id, lesson.id)}>
                    <button type="submit" className="text-xs text-red-500 hover:underline">
                      Delete
                    </button>
                  </form>
                </div>
                <ul className="text-sm text-gray-500 mt-1">
                  {(q.choices as string[]).map((c) => (
                    <li key={c} className={c.startsWith(q.correctAnswer) ? "font-semibold text-green-600" : ""}>
                      {c}
                    </li>
                  ))}
                </ul>
                {q.explanation && <p className="text-xs text-gray-400 mt-1">💡 {q.explanation}</p>}
              </div>
            ))}
            {lesson.quiz.questions.length === 0 && (
              <p className="text-gray-400 text-sm">No questions yet — add one below.</p>
            )}
          </div>

          <form action={addQuestion.bind(null, lesson.quiz.id, lesson.id)} className="border rounded p-4 space-y-3">
            <h3 className="font-semibold text-sm">Add a question</h3>
            <textarea name="prompt" placeholder="Question text" required className="w-full border rounded px-3 py-2 text-sm" />

            <div className="grid grid-cols-2 gap-2">
              <input name="choiceA" placeholder="Choice A" required className="border rounded px-3 py-2 text-sm" />
              <input name="choiceB" placeholder="Choice B" required className="border rounded px-3 py-2 text-sm" />
              <input name="choiceC" placeholder="Choice C" required className="border rounded px-3 py-2 text-sm" />
              <input name="choiceD" placeholder="Choice D" required className="border rounded px-3 py-2 text-sm" />
            </div>

            <label className="block text-sm">
              Correct answer
              <select name="correctAnswer" required className="w-full border rounded px-3 py-2 mt-1 text-sm">
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </label>

            <textarea
              name="explanation"
              placeholder="Explanation shown after the student answers (optional)"
              className="w-full border rounded px-3 py-2 text-sm"
            />

            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
              Add Question
            </button>
          </form>
        </>
      )}
    </main>
  );
}
