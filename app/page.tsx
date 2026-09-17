import Link from "next/link";

export default function HomePage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold mb-3">AralTech Hub</h1>
      <p className="text-gray-500 mb-8">
        Free, DepEd-aligned reviewers for Filipino K-12 students.
      </p>
      <Link
        href="/subjects"
        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
      >
        Browse Subjects
      </Link>
    </main>
  );
}
