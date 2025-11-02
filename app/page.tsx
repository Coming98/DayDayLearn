import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <main className="flex flex-col items-center justify-center gap-8 px-8 py-16 text-center">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-6xl font-bold tracking-tight text-gray-900 dark:text-white">
            DayDayLearn
          </h1>
          <p className="max-w-md text-xl text-gray-600 dark:text-gray-300">
            Master English vocabulary with interactive flashcards
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/learn"
            className="flex h-14 items-center justify-center gap-2 rounded-full bg-blue-600 px-8 text-lg font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl active:scale-95"
          >
            Start Learning →
          </Link>
          
          <a
            href="https://github.com/Coming98/DayDayLearn"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-14 items-center justify-center rounded-full border-2 border-gray-300 px-8 text-lg font-semibold text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-800 active:scale-95"
          >
            View on GitHub
          </a>
        </div>

        <div className="mt-8 grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-md dark:bg-gray-800">
            <div className="mb-2 text-3xl font-bold text-blue-600 dark:text-blue-400">15+</div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Flashcards</p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-md dark:bg-gray-800">
            <div className="mb-2 text-3xl font-bold text-purple-600 dark:text-purple-400">4</div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Categories</p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-md dark:bg-gray-800">
            <div className="mb-2 text-3xl font-bold text-green-600 dark:text-green-400">∞</div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Practice Sessions</p>
          </div>
        </div>
      </main>
    </div>
  );
}
