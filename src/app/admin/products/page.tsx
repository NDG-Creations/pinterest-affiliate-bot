import Link from "next/link";
import Image from "next/image";
import { ProductStatus, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { GeneratePinImageButton } from "./GeneratePinImageButton";
import { GeneratePinTextButton } from "./GeneratePinTextButton";
import { ProcessNextProductButton } from "./ProcessNextProductButton";

export const dynamic = "force-dynamic";

type ProductsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const pageSize = 20;
const statusFilters = ["ALL", "NEW", "GENERATED", "READY", "FAILED"] as const;
const sourceFilters = [
  "ALL",
  "Amazon",
  "Flipkart",
  "Meesho",
  "Myntra",
  "Ajio",
] as const;
const sortOptions = ["newest", "oldest"] as const;

const getQueryValue = (
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) => {
  const value = searchParams[key];

  return Array.isArray(value) ? value[0] : value;
};

const getHrefWithPage = (
  searchParams: Record<string, string | string[] | undefined>,
  page: number,
) => {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    const normalizedValue = Array.isArray(value) ? value[0] : value;

    if (normalizedValue && key !== "page") {
      params.set(key, normalizedValue);
    }
  }

  if (page > 1) {
    params.set("page", page.toString());
  }

  const queryString = params.toString();

  return queryString ? `/admin/products?${queryString}` : "/admin/products";
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedSearchParams = await searchParams;
  const search = getQueryValue(resolvedSearchParams, "search")?.trim() ?? "";
  const status = getQueryValue(resolvedSearchParams, "status") ?? "ALL";
  const source = getQueryValue(resolvedSearchParams, "source") ?? "ALL";
  const sort = getQueryValue(resolvedSearchParams, "sort") ?? "newest";
  const page = Math.max(
    Number.parseInt(getQueryValue(resolvedSearchParams, "page") ?? "1", 10) || 1,
    1,
  );
  const normalizedStatus = statusFilters.includes(
    status as (typeof statusFilters)[number],
  )
    ? status
    : "ALL";
  const normalizedSource = sourceFilters.includes(
    source as (typeof sourceFilters)[number],
  )
    ? source
    : "ALL";
  const normalizedSort = sortOptions.includes(sort as (typeof sortOptions)[number])
    ? sort
    : "newest";
  const where: Prisma.ProductWhereInput = {
    ...(search
      ? {
          OR: [
            { productTitle: { contains: search, mode: "insensitive" } },
            { source: { contains: search, mode: "insensitive" } },
            { category: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(normalizedStatus !== "ALL"
      ? { status: normalizedStatus as ProductStatus }
      : {}),
    ...(normalizedSource !== "ALL" ? { source: normalizedSource } : {}),
  };
  const filteredCount = await prisma.product.count({ where });
  const totalPages = Math.max(Math.ceil(filteredCount / pageSize), 1);
  const currentPage = Math.min(page, totalPages);

  const [products, totalProducts, newCount, generatedCount, readyCount, failedCount] =
    await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: {
          createdAt: normalizedSort === "oldest" ? "asc" : "desc",
        },
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
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
      }),
      prisma.product.count(),
      prisma.product.count({ where: { status: "NEW" } }),
      prisma.product.count({ where: { status: "GENERATED" } }),
      prisma.product.count({ where: { status: "READY" } }),
      prisma.product.count({ where: { status: "FAILED" } }),
    ]);

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
            <ProcessNextProductButton />
            <Link
              href="/admin/pinterest"
              className="inline-flex h-11 items-center justify-center rounded-md border border-zinc-300 px-5 text-sm font-medium text-foreground transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              Pinterest boards
            </Link>
            <Link
              href="/admin/products/bulk"
              className="inline-flex h-11 items-center justify-center rounded-md border border-zinc-300 px-5 text-sm font-medium text-foreground transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              Bulk Import
            </Link>
            <Link
              href="/admin/products/ready"
              className="inline-flex h-11 items-center justify-center rounded-md border border-zinc-300 px-5 text-sm font-medium text-foreground transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              Ready Products
            </Link>
            <Link
              href="/admin/products/new"
              className="inline-flex h-11 items-center justify-center rounded-md bg-foreground px-5 text-sm font-medium text-background transition-colors hover:opacity-85"
            >
              Add product
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["Total", totalProducts],
            ["NEW", newCount],
            ["GENERATED", generatedCount],
            ["READY", readyCount],
            ["FAILED", failedCount],
          ].map(([label, value]) => (
            <div
              className="rounded-md border border-zinc-200 px-4 py-3 dark:border-zinc-800"
              key={label}
            >
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                {label}
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {value}
              </p>
            </div>
          ))}
        </div>

        <form
          action="/admin/products"
          className="mt-8 grid gap-4 rounded-md border border-zinc-200 p-4 dark:border-zinc-800 lg:grid-cols-[1fr_180px_180px_180px_auto]"
        >
          <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Search
            <input
              className="mt-2 block h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition-colors focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-300"
              defaultValue={search}
              name="search"
              placeholder="Title, source, category"
            />
          </label>

          <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Status
            <select
              className="mt-2 block h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition-colors focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-300"
              defaultValue={normalizedStatus}
              name="status"
            >
              {statusFilters.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Source
            <select
              className="mt-2 block h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition-colors focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-300"
              defaultValue={normalizedSource}
              name="source"
            >
              {sourceFilters.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Sort
            <select
              className="mt-2 block h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition-colors focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-300"
              defaultValue={normalizedSort}
              name="sort"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </label>

          <div className="flex items-end gap-3">
            <button
              className="inline-flex h-10 items-center justify-center rounded-md bg-foreground px-5 text-sm font-medium text-background transition-colors hover:opacity-85"
              type="submit"
            >
              Apply
            </button>
            <Link
              className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-300 px-4 text-sm font-medium text-foreground transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
              href="/admin/products"
            >
              Reset
            </Link>
          </div>
        </form>

        <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          Showing {products.length} of {filteredCount} matching products.
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
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="inline-flex h-9 items-center justify-center rounded-md border border-zinc-300 px-3 text-xs font-medium text-foreground transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
                      >
                        Edit
                      </Link>
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

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-3">
            {currentPage > 1 ? (
              <Link
                className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-300 px-4 text-sm font-medium text-foreground transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
                href={getHrefWithPage(resolvedSearchParams, currentPage - 1)}
              >
                Previous
              </Link>
            ) : null}
            {currentPage < totalPages ? (
              <Link
                className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-300 px-4 text-sm font-medium text-foreground transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
                href={getHrefWithPage(resolvedSearchParams, currentPage + 1)}
              >
                Next
              </Link>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
