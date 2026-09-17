"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { markLessonComplete } from "@/lib/actions/student";

export default function MarkCompleteButton({
  lessonId,
  initiallyCompleted,
}: {
  lessonId: string;
  initiallyCompleted: boolean;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [completed, setCompleted] = useState(initiallyCompleted);
  const [isPending, startTransition] = useTransition();

  if (!session?.user) {
    return (
      <Link
        href="/auth/signin"
        className="inline-block text-sm text-gray-500 border rounded px-3 py-1.5 hover:bg-gray-50"
      >
        Sign in to track your progress
      </Link>
    );
  }

  if (completed) {
    return (
      <span className="text-sm text-green-600 font-medium">✓ Completed</span>
    );
  }

  return (
    <button
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const result = await markLessonComplete(lessonId, pathname);
          if (result.ok) setCompleted(true);
        })
      }
      className="text-sm bg-gray-900 text-white rounded px-3 py-1.5 hover:bg-gray-800 disabled:opacity-50"
    >
      {isPending ? "Saving..." : "Mark as complete"}
    </button>
  );
}
