import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PostedProductsPage() {
  const products = await prisma.product.findMany({
    where: {
      status: "POSTED",
    },
    orderBy: {
      updatedAt: "desc",
    },
    select: {
      id: true,
      productTitle: true,
      productUrl: true,
      affiliateUrl: true,
      source: true,
      pinTitle: true,
      pinImageUrl: true,
      updatedAt: true,
    },
  });

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <section className="mx-auto w-full max-w-5xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
              Manual Posting
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
              Posted Products
            </h1>
          </div>
          <Link
            href="/admin/products"
            className="inline-flex h-11 items-center justify-center rounded-md border border-zinc-300 px-5 text-sm font-medium text-foreground transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Back to products
          </Link>
        </div>

        <div className="mt-8 overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-800">
          {products.length > 0 ? (
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-zinc-50 text-zinc-600 dark:bg-zinc-950 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Image</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Link</th>
                  <th className="px-4 py-3 font-medium">Posted date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {products.map((product) => {
                  const title = product.pinTitle || product.productTitle;
                  const link = product.affiliateUrl || product.productUrl;

                  return (
                    <tr key={product.id}>
                      <td className="px-4 py-4 font-medium text-foreground">
                        {title}
                      </td>
                      <td className="px-4 py-4">
                        {product.pinImageUrl ? (
                          <Image
                            alt={`${title} pin image`}
                            className="h-36 w-24 rounded-md border border-zinc-200 object-cover dark:border-zinc-800"
                            height={144}
                            src={product.pinImageUrl}
                            width={96}
                          />
                        ) : (
                          <span className="text-zinc-400">No image</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-zinc-600 dark:text-zinc-400">
                        {product.source}
                      </td>
                      <td className="max-w-xs px-4 py-4 text-zinc-600 dark:text-zinc-400">
                        <a
                          className="break-words underline underline-offset-4"
                          href={link}
                          rel="noreferrer"
                          target="_blank"
                        >
                          {link}
                        </a>
                      </td>
                      <td className="px-4 py-4 text-zinc-600 dark:text-zinc-400">
                        {product.updatedAt.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="px-4 py-12 text-center">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                No POSTED products yet.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
