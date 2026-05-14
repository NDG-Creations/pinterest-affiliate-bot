"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import {
  createProduct,
  fetchProductMetadataForForm,
  type ProductFormState,
} from "../actions";

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
  const [metadataMessage, setMetadataMessage] = useState<string | null>(null);
  const [isFetchingMetadata, startMetadataTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const sourceRef = useRef<HTMLInputElement>(null);
  const productUrlRef = useRef<HTMLInputElement>(null);
  const productTitleRef = useRef<HTMLInputElement>(null);
  const productImageUrlRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  const fetchDetails = () => {
    const productUrl = productUrlRef.current?.value.trim() ?? "";

    setMetadataMessage(null);
    startMetadataTransition(async () => {
      const result = await fetchProductMetadataForForm(productUrl);

      if (result.error) {
        setMetadataMessage(
          `${result.error} Some websites may block automatic metadata. Please manually enter title/image if needed.`,
        );
        return;
      }

      if (!result.metadata) {
        setMetadataMessage(
          "Product metadata is unavailable for this page. Some websites may block automatic metadata. Please manually enter title/image if needed.",
        );
        return;
      }

      sourceRef.current!.value = result.metadata.source;
      productTitleRef.current!.value = result.metadata.productTitle;

      if (result.metadata.productImageUrl && productImageUrlRef.current) {
        productImageUrlRef.current.value = result.metadata.productImageUrl;
      }

      if (result.metadata.price && priceRef.current) {
        priceRef.current.value = result.metadata.price;
      }

      if (result.metadata.category && categoryRef.current) {
        categoryRef.current.value = result.metadata.category;
      }

      setMetadataMessage("Product details filled from page metadata.");
    });
  };

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
            ref={sourceRef}
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
            ref={categoryRef}
          />
        </label>
      </div>

      <div>
        <label className={labelClassName}>
          Product URL
          <input
            className={fieldClassName}
            name="productUrl"
            placeholder="https://example.com/product"
            ref={productUrlRef}
            required
            type="url"
          />
          <FieldError message={state.errors?.productUrl} />
        </label>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-300 px-4 text-sm font-medium text-foreground transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:hover:bg-zinc-900"
            disabled={isFetchingMetadata}
            onClick={fetchDetails}
            type="button"
          >
            {isFetchingMetadata ? "Fetching..." : "Fetch Product Details"}
          </button>
          {metadataMessage ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {metadataMessage}
            </p>
          ) : null}
        </div>
      </div>

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
          ref={productTitleRef}
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
            ref={productImageUrlRef}
            type="url"
          />
        </label>

        <label className={labelClassName}>
          Price
          <input
            className={fieldClassName}
            name="price"
            placeholder="$49.99"
            ref={priceRef}
          />
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
