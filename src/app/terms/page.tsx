import Link from "next/link";

export default function TermsPage() {
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
          Terms of Use
        </h1>
        <div className="mt-6 space-y-5 text-base leading-7 text-zinc-600 dark:text-zinc-400">
          <p>
            DG Community Affiliate Bot is provided for managing affiliate
            product pins and related export data.
          </p>
          <p>
            Affiliate links may be used in product records, generated pin
            descriptions, and export data.
          </p>
          <p>
            Users are responsible for verifying the accuracy of product
            information, product links, affiliate links, disclosures, pricing,
            and generated pin content before using or publishing it.
          </p>
          <p>
            The app is for authorized account usage only. Users must only use
            Pinterest accounts, boards, and access tokens that they are allowed
            to manage.
          </p>
        </div>
      </article>
    </main>
  );
}
