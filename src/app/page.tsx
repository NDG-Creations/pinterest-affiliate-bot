import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-background px-6 py-16">
      <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
            Starter project
          </p>
          <div className="mt-4 space-y-5">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              DG Community Affiliate Bot
            </h1>
            <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              A clean Next.js, TypeScript, Prisma, and PostgreSQL foundation for
              future Pinterest affiliate automation work.
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/admin/products"
              className="inline-flex h-11 items-center justify-center rounded-md bg-foreground px-5 text-sm font-medium text-background transition-colors hover:opacity-85"
            >
              Open admin products
            </Link>
            <Link
              href="/admin/pinterest"
              className="inline-flex h-11 items-center justify-center rounded-md border border-zinc-300 px-5 text-sm font-medium text-foreground transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              Open Pinterest admin
            </Link>
          </div>
        </div>
        <footer className="mt-16 flex flex-wrap gap-5 border-t border-zinc-200 pt-6 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
          <Link
            className="transition-colors hover:text-foreground"
            href="/about"
          >
            About
          </Link>
          <Link
            className="transition-colors hover:text-foreground"
            href="/privacy"
          >
            Privacy
          </Link>
          <Link
            className="transition-colors hover:text-foreground"
            href="/terms"
          >
            Terms
          </Link>
        </footer>
      </section>
    </main>
  );
}
