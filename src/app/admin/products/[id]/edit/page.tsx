import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GeneratePinImageButton } from "../../GeneratePinImageButton";
import { GeneratePinTextButton } from "../../GeneratePinTextButton";
import { EditProductForm } from "./EditProductForm";

type EditProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      productTitle: true,
      productUrl: true,
      affiliateUrl: true,
      price: true,
      category: true,
      pinTitle: true,
      pinDescription: true,
      pinImageUrl: true,
      status: true,
    },
  });

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <section className="mx-auto w-full max-w-5xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
              Admin
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
              Edit Product
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Current status: {product.status}
            </p>
          </div>
          <Link
            href="/admin/products"
            className="inline-flex h-11 items-center justify-center rounded-md border border-zinc-300 px-5 text-sm font-medium text-foreground transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Back to products
          </Link>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_280px]">
          <div>
            <EditProductForm product={product} />
          </div>

          <aside className="space-y-6">
            <div>
              <p className="mb-3 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Pin Image Preview
              </p>
              {product.pinImageUrl ? (
                <Image
                  alt={`${product.productTitle} pin image`}
                  className="aspect-[2/3] w-full rounded-md border border-zinc-200 object-cover dark:border-zinc-800"
                  height={420}
                  src={product.pinImageUrl}
                  width={280}
                />
              ) : (
                <div className="rounded-md border border-dashed border-zinc-300 px-4 py-12 text-center text-sm text-zinc-500 dark:border-zinc-700">
                  No pin image yet.
                </div>
              )}
            </div>

            <div className="space-y-3">
              <GeneratePinTextButton productId={product.id} />
              <GeneratePinImageButton productId={product.id} />
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
