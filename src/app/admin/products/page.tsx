import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { GeneratePinImageButton } from "./GeneratePinImageButton";
import { GeneratePinTextButton } from "./GeneratePinTextButton";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      productTitle: true,
      source: true,
      category: true,
      price: true,
      status: true,
      pinTitle: true,
      pinDescription: true,
      pinImageUrl: true,
      createdAt: true,
    },
  });

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <section className="mx-auto w-full max-w-5xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
              Admin
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
              Products
            </h1>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/admin/pinterest"
              className="inline-flex h-11 items-center justify-center rounded-md border border-zinc-300 px-5 text-sm font-medium text-foreground transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              Pinterest boards
            </Link>
            <Link
              href="/admin/products/new"
              className="inline-flex h-11 items-center justify-center rounded-md bg-foreground px-5 text-sm font-medium text-background transition-colors hover:opacity-85"
            >
              Add product
            </Link>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-800">
          {products.length > 0 ? (
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-zinc-50 text-zinc-600 dark:bg-zinc-950 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Pin Image</th>
                  <th className="px-4 py-3 font-medium">Generated Pin Text</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-4 py-4 font-medium text-foreground">
                      {product.productTitle}
                    </td>
                    <td className="px-4 py-4 text-zinc-600 dark:text-zinc-400">
                      {product.source}
                    </td>
                    <td className="px-4 py-4 text-zinc-600 dark:text-zinc-400">
                      {product.status}
                    </td>
                    <td className="px-4 py-4">
                      {product.pinImageUrl ? (
                        <Image
                          alt={`${product.productTitle} generated pin`}
                          className="h-36 w-24 rounded-md border border-zinc-200 object-cover dark:border-zinc-800"
                          height={144}
                          src={product.pinImageUrl}
                          width={96}
                        />
                      ) : (
                        <span className="text-zinc-400">No image</span>
                      )}
                    </td>
                    <td className="max-w-sm px-4 py-4 text-zinc-600 dark:text-zinc-400">
                      {product.pinTitle || product.pinDescription ? (
                        <div className="space-y-2">
                          {product.pinTitle ? (
                            <p className="font-medium text-foreground">
                              {product.pinTitle}
                            </p>
                          ) : null}
                          {product.pinDescription ? (
                            <p className="leading-6">{product.pinDescription}</p>
                          ) : null}
                        </div>
                      ) : (
                        <span className="text-zinc-400">Not generated</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-zinc-600 dark:text-zinc-400">
                      {product.createdAt.toLocaleString()}
                    </td>
                    <td className="space-y-3 px-4 py-4">
                      <GeneratePinTextButton productId={product.id} />
                      <GeneratePinImageButton productId={product.id} />
                      <Link
                        href={`/admin/products/${product.id}/export`}
                        className="inline-flex h-9 items-center justify-center rounded-md border border-zinc-300 px-3 text-xs font-medium text-foreground transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
                      >
                        Export Pin Data
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-4 py-12 text-center">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                No products have been added yet.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
