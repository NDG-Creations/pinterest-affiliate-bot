import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-16">
      <article className="mx-auto max-w-3xl">
        <Link
          className="text-sm font-medium text-zinc-600 transition-colors hover:text-foreground dark:text-zinc-400"
          href="/"
        >
          Back home
        </Link>
        <h1 className="mt-8 text-4xl font-semibold tracking-tight text-foreground">
          About DG Community Affiliate Bot
        </h1>
        <div className="mt-6 space-y-5 text-base leading-7 text-zinc-600 dark:text-zinc-400">
          <p>
            DG Community Affiliate Bot helps create and organize affiliate
            product pins for Pinterest workflows.
          </p>
          <p>
            The app helps generate pin images, pin titles, pin descriptions, and
            export-ready pin data so users can prepare affiliate product content
            in one place.
          </p>
          <p>
            Future Pinterest API publishing features will only publish to boards
            owned by the authenticated user.
          </p>
        </div>
      </article>
    </main>
  );
}
