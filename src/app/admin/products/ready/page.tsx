import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CopyField } from "../[id]/export/CopyField";
import { MarkPostedButton } from "./MarkPostedButton";

export const dynamic = "force-dynamic";

export default async function ReadyProductsPage() {
  const products = await prisma.product.findMany({
    where: {
      status: "READY",
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      productTitle: true,
      productUrl: true,
      affiliateUrl: true,
      source: true,
      pinTitle: true,
      pinDescription: true,
      pinImageUrl: true,
      createdAt: true,
    },
  });

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <section className="mx-auto w-full max-w-6xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
              Manual Posting
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
              Ready Products
            </h1>
          </div>
          <Link
            href="/admin/products"
            className="inline-flex h-11 items-center justify-center rounded-md border border-zinc-300 px-5 text-sm font-medium text-foreground transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Back to products
          </Link>
        </div>

        <div className="mt-8 space-y-6">
          {products.length > 0 ? (
            products.map((product) => {
              const pinTitle = product.pinTitle || product.productTitle;
              const pinDescription =
                product.pinDescription ||
                "Pin description has not been generated yet.";
              const pinLink = product.affiliateUrl || product.productUrl;
              const imageUrl = product.pinImageUrl || "";

              return (
                <article
                  className="grid gap-6 rounded-md border border-zinc-200 p-4 dark:border-zinc-800 lg:grid-cols-[220px_1fr]"
                  key={product.id}
                >
                  <div>
                    {product.pinImageUrl ? (
                      <Image
                        alt={`${pinTitle} pin image`}
                        className="aspect-[2/3] w-full rounded-md border border-zinc-200 object-cover dark:border-zinc-800"
                        height={330}
                        src={product.pinImageUrl}
                        width={220}
                      />
                    ) : (
                      <div className="aspect-[2/3] rounded-md border border-dashed border-zinc-300 px-4 py-12 text-center text-sm text-zinc-500 dark:border-zinc-700">
                        No pin image
                      </div>
                    )}
                  </div>

                  <div className="space-y-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm text-zinc-500">
                          {product.source} · {product.createdAt.toLocaleString()}
                        </p>
                        <h2 className="mt-2 text-xl font-semibold text-foreground">
                          {pinTitle}
                        </h2>
                      </div>
                      <div className="flex flex-col gap-3">
                        <Link
                          href={`/admin/products/${product.id}/export`}
                          className="inline-flex h-10 items-center justify-center rounded-md bg-foreground px-4 text-sm font-medium text-background transition-colors hover:opacity-85"
                        >
                          Open Export Page
                        </Link>
                        <MarkPostedButton productId={product.id} />
                      </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <CopyField label="Title" value={pinTitle} />
                      <CopyField label="Link" value={pinLink} />
                      <CopyField
                        label="Description"
                        multiline
                        value={pinDescription}
                      />
                      <CopyField label="Image URL" value={imageUrl} />
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-md border border-zinc-200 px-4 py-12 text-center dark:border-zinc-800">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                No READY products yet.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
