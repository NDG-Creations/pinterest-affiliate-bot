import Link from "next/link";
import { PinterestBoardsPanel } from "./PinterestBoardsPanel";

export default function PinterestAdminPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <section className="mx-auto w-full max-w-4xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
              Admin
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
              Pinterest Boards
            </h1>
          </div>
          <Link
            href="/admin/products"
            className="inline-flex h-11 items-center justify-center rounded-md border border-zinc-300 px-5 text-sm font-medium text-foreground transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Back to products
          </Link>
        </div>

        <PinterestBoardsPanel />
      </section>
    </main>
  );
}
