"use client";

import { useActionState } from "react";
import {
  updateProduct,
  type EditProductFormState,
} from "@/app/admin/products/actions";

type EditProductFormProps = {
  product: {
    id: string;
    productTitle: string;
    productUrl: string;
    affiliateUrl: string | null;
    price: string | null;
    category: string | null;
    pinTitle: string | null;
    pinDescription: string | null;
    pinImageUrl: string | null;
  };
};

const initialState: EditProductFormState = {};

const fieldClassName =
  "mt-2 block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition-colors focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-300";

const labelClassName = "block text-sm font-medium text-zinc-800 dark:text-zinc-200";

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-sm text-red-600">{message}</p>;
}

export function EditProductForm({ product }: EditProductFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateProduct,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-6">
      <input name="productId" type="hidden" value={product.id} />

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

      <label className={labelClassName}>
        Product Title
        <input
          className={fieldClassName}
          defaultValue={product.productTitle}
          name="productTitle"
          required
        />
        <FieldError message={state.errors?.productTitle} />
      </label>

      <label className={labelClassName}>
        Product URL
        <input
          className={fieldClassName}
          defaultValue={product.productUrl}
          name="productUrl"
          required
          type="url"
        />
        <FieldError message={state.errors?.productUrl} />
      </label>

      <label className={labelClassName}>
        Affiliate URL
        <input
          className={fieldClassName}
          defaultValue={product.affiliateUrl ?? ""}
          name="affiliateUrl"
          type="url"
        />
      </label>

      <div className="grid gap-6 sm:grid-cols-2">
        <label className={labelClassName}>
          Product Price
          <input
            className={fieldClassName}
            defaultValue={product.price ?? ""}
            name="productPrice"
          />
        </label>

        <label className={labelClassName}>
          Category
          <input
            className={fieldClassName}
            defaultValue={product.category ?? ""}
            name="category"
          />
        </label>
      </div>

      <label className={labelClassName}>
        Pin Title
        <input
          className={fieldClassName}
          defaultValue={product.pinTitle ?? ""}
          name="pinTitle"
        />
      </label>

      <label className={labelClassName}>
        Pin Description
        <textarea
          className={fieldClassName}
          defaultValue={product.pinDescription ?? ""}
          name="pinDescription"
          rows={6}
        />
      </label>

      <label className={labelClassName}>
        Pin Image URL
        <input
          className={fieldClassName}
          defaultValue={product.pinImageUrl ?? ""}
          name="pinImageUrl"
          type="text"
        />
      </label>

      <button
        className="inline-flex h-11 items-center justify-center rounded-md bg-foreground px-5 text-sm font-medium text-background transition-colors hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
