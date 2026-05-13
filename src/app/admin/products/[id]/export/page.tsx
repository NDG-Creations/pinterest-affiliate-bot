import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CopyField } from "./CopyField";

type ExportProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function ExportProductPage({
  params,
}: ExportProductPageProps) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      productTitle: true,
      productUrl: true,
      affiliateUrl: true,
      pinTitle: true,
      pinDescription: true,
      pinImageUrl: true,
    },
  });

  if (!product) {
    notFound();
  }

  const pinTitle = product.pinTitle || product.productTitle;
  const pinDescription =
    product.pinDescription || "Generate pin text before publishing this pin.";
  const pinLink = product.affiliateUrl || product.productUrl;

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <section className="mx-auto w-full max-w-5xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
              Manual Pinterest Export
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
              Export Pin Data
            </h1>
          </div>
          <Link
            href="/admin/products"
            className="inline-flex h-11 items-center justify-center rounded-md border border-zinc-300 px-5 text-sm font-medium text-foreground transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Back to products
          </Link>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[340px_1fr]">
          <div>
            <p className="mb-3 text-sm font-medium text-zinc-800 dark:text-zinc-200">
              Pin image path
            </p>
            {product.pinImageUrl ? (
              <div className="space-y-4">
                <Image
                  alt={`${pinTitle} pin image`}
                  className="aspect-[2/3] w-full rounded-md border border-zinc-200 object-cover dark:border-zinc-800"
                  height={510}
                  src={product.pinImageUrl}
                  width={340}
                />
                <CopyField label="Image path" value={product.pinImageUrl} />
              </div>
            ) : (
              <div className="rounded-md border border-dashed border-zinc-300 px-4 py-12 text-center text-sm text-zinc-500 dark:border-zinc-700">
                Generate a pin image before exporting.
              </div>
            )}
          </div>

          <div className="space-y-6">
            <CopyField label="Pin title" value={pinTitle} />
            <CopyField
              label="Pin description"
              multiline
              value={pinDescription}
            />
            <CopyField label="Affiliate or product link" value={pinLink} />
          </div>
        </div>
      </section>
    </main>
  );
}
