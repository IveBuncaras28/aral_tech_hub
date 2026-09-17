"use client";

import { Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

const ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked:
    "That email is already registered with a different sign-in method. Please use the method you signed up with originally.",
};

function SignInError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  if (!error) return null;

  return (
    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3 mb-6">
      {ERROR_MESSAGES[error] ?? "Something went wrong signing you in. Please try again."}
    </p>
  );
}

export default function SignInPage() {
  return (
    <main className="max-w-sm mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold mb-2">Sign in to AralTech Hub</h1>
      <p className="text-gray-500 mb-8">Track your progress and quiz scores across devices.</p>

      <Suspense fallback={null}>
        <SignInError />
      </Suspense>

      <div className="space-y-3">
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full border rounded-lg px-4 py-2.5 font-medium hover:bg-gray-50"
        >
          Continue with Google
        </button>
        <button
          onClick={() => signIn("facebook", { callbackUrl: "/" })}
          className="w-full bg-[#1877F2] text-white rounded-lg px-4 py-2.5 font-medium hover:bg-[#166fe0]"
        >
          Continue with Facebook
        </button>
      </div>
    </main>
  );
}
