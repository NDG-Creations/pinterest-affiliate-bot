import Link from "next/link";

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <div className="mt-6 space-y-5 text-base leading-7 text-zinc-600 dark:text-zinc-400">
          <p>
            DG Community Affiliate Bot stores product records that users enter
            into the app for affiliate pin management.
          </p>
          <p>
            Stored data may include product source names, product URLs,
            affiliate URLs, product titles, product image URLs, prices,
            categories, generated pin titles, generated pin descriptions, and
            generated pin image paths.
          </p>
          <p>
            Product URLs and generated pin content are stored so users can
            organize, review, and export Pinterest-ready affiliate content.
          </p>
          <p>
            Pinterest API tokens are stored only as environment variables. They
            are not stored in the application database.
          </p>
          <p>
            DG Community Affiliate Bot does not sell user data.
          </p>
          <p>
            For privacy questions, contact{" "}
            <a
              className="font-medium text-foreground underline underline-offset-4"
              href="mailto:gouddhanush776@gmail.com"
            >
              gouddhanush776@gmail.com
            </a>
            .
          </p>
        </div>
      </article>
    </main>
  );
}
