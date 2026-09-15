"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { recordQuizAttempt } from "@/lib/actions/student";

interface Question {
  id: string;
  prompt: string;
  choices: string[];
  correctAnswer: string;
  explanation?: string | null;
}

interface Quiz {
  id: string;
  title: string;
  questions: Question[];
}

export default function QuizBlock({ quiz }: { quiz: Quiz }) {
  const { data: session } = useSession();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const score = quiz.questions.reduce(
    (total, q) => total + (answers[q.id] === q.correctAnswer ? 1 : 0),
    0
  );

  function handleSubmit() {
    setSubmitted(true);
    if (session?.user) {
      startTransition(async () => {
        const result = await recordQuizAttempt(quiz.id, score, quiz.questions.length);
        if (result.ok) setSaved(true);
      });
    }
  }

  return (
    <section className="mt-10 border-t pt-6">
      <h2 className="text-xl font-semibold mb-4">{quiz.title}</h2>

      {quiz.questions.map((q, idx) => (
        <div key={q.id} className="mb-6">
          <p className="font-medium mb-2">
            {idx + 1}. {q.prompt}
          </p>
          <div className="space-y-1">
            {q.choices.map((choice) => {
              const letter = choice.trim()[0]; // "A. text" -> "A"
              const isSelected = answers[q.id] === letter;
              const isCorrectChoice = submitted && letter === q.correctAnswer;
              const isWrongSelected = submitted && isSelected && letter !== q.correctAnswer;

              return (
                <button
                  key={choice}
                  disabled={submitted}
                  onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: letter }))}
                  className={`block w-full text-left px-3 py-2 rounded border
                    ${isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200"}
                    ${isCorrectChoice ? "border-green-500 bg-green-50" : ""}
                    ${isWrongSelected ? "border-red-500 bg-red-50" : ""}`}
                >
                  {choice}
                </button>
              );
            })}
          </div>
          {submitted && q.explanation && (
            <p className="text-sm text-gray-500 mt-2">💡 {q.explanation}</p>
          )}
        </div>
      ))}

      {!submitted ? (
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Check answers
        </button>
      ) : (
        <div>
          <p className="font-semibold">
            Score: {score} / {quiz.questions.length}
          </p>
          {session?.user ? (
            <p className="text-xs text-gray-400 mt-1">
              {isPending ? "Saving..." : saved ? "Saved to your quiz history." : ""}
            </p>
          ) : (
            <p className="text-xs text-gray-400 mt-1">
              <Link href="/auth/signin" className="text-blue-600 hover:underline">
                Sign in
              </Link>{" "}
              to save this score to your quiz history.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
