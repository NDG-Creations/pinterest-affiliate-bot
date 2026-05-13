"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { createProduct, type ProductFormState } from "../actions";

const initialState: ProductFormState = {};

const fieldClassName =
  "mt-2 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition-colors focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-300";

const labelClassName = "block text-sm font-medium text-zinc-800 dark:text-zinc-200";

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-sm text-red-600">{message}</p>;
}

export function ProductForm() {
  const [state, formAction, isPending] = useActionState(
    createProduct,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="mt-8 space-y-6">
      {state.success ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
          {state.success}
        </div>
      ) : null}

      {state.errors?.form ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {state.errors.form}
        </div>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <label className={labelClassName}>
          Source
          <input
            className={fieldClassName}
            name="source"
            placeholder="Amazon"
            required
          />
          <FieldError message={state.errors?.source} />
        </label>

        <label className={labelClassName}>
          Category
          <input
            className={fieldClassName}
            name="category"
            placeholder="Home office"
          />
        </label>
      </div>

      <label className={labelClassName}>
        Product URL
        <input
          className={fieldClassName}
          name="productUrl"
          placeholder="https://example.com/product"
          required
          type="url"
        />
        <FieldError message={state.errors?.productUrl} />
      </label>

      <label className={labelClassName}>
        Affiliate URL
        <input
          className={fieldClassName}
          name="affiliateUrl"
          placeholder="https://example.com/product?tag=affiliate"
          type="url"
        />
      </label>

      <label className={labelClassName}>
        Product Title
        <input
          className={fieldClassName}
          name="productTitle"
          placeholder="Adjustable desk lamp"
          required
        />
        <FieldError message={state.errors?.productTitle} />
      </label>

      <div className="grid gap-6 sm:grid-cols-2">
        <label className={labelClassName}>
          Product Image URL
          <input
            className={fieldClassName}
            name="productImageUrl"
            placeholder="https://example.com/image.jpg"
            type="url"
          />
        </label>

        <label className={labelClassName}>
          Price
          <input className={fieldClassName} name="price" placeholder="$49.99" />
        </label>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          className="inline-flex h-11 items-center justify-center rounded-md bg-foreground px-5 text-sm font-medium text-background transition-colors hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Saving..." : "Save product"}
        </button>
        <Link
          href="/admin/products"
          className="inline-flex h-11 items-center justify-center rounded-md border border-zinc-300 px-5 text-sm font-medium text-foreground transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          View products
        </Link>
      </div>
    </form>
  );
}
