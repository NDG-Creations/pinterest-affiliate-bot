import Link from "next/link";
import { ProductForm } from "./ProductForm";

export default function NewProductPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <section className="mx-auto w-full max-w-3xl">
        <Link
          href="/admin/products"
          className="text-sm font-medium text-zinc-600 hover:text-foreground dark:text-zinc-400"
        >
          Back to products
        </Link>
        <div className="mt-6">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
            Admin
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
            Add product
          </h1>
        </div>
        <ProductForm />
      </section>
    </main>
  );
}
