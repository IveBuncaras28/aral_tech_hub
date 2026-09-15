"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="border-b">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg">
          AralTech Hub
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/subjects" className="hover:underline">
            Subjects
          </Link>

          {status === "loading" ? null : session?.user ? (
            <>
              <Link href="/account/progress" className="hover:underline">
                My Progress
              </Link>
              {session.user.role === "ADMIN" && (
                <Link href="/admin" className="hover:underline">
                  Admin
                </Link>
              )}
              <button onClick={() => signOut()} className="text-gray-500 hover:underline">
                Sign out ({session.user.name?.split(" ")[0]})
              </button>
            </>
          ) : (
            <Link
              href="/auth/signin"
              className="bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
