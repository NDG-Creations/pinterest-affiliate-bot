"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  bulkImportProducts,
  type BulkImportProductsState,
} from "../actions";

const initialState: BulkImportProductsState = {};

export function BulkImportForm() {
  const [state, formAction, isPending] = useActionState(
    bulkImportProducts,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.importedCount !== undefined) {
      formRef.current?.reset();
    }
  }, [state.importedCount]);

  return (
    <form ref={formRef} action={formAction} className="mt-8 space-y-6">
      <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200">
        Bulk input
        <textarea
          className="mt-2 block min-h-80 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 font-mono text-sm text-zinc-950 outline-none transition-colors focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-300"
          name="bulkInput"
          placeholder={`https://www.amazon.in/example-product\nAmazon|Desk lamp|https://www.amazon.in/desk-lamp|₹999|Home office`}
          required
        />
      </label>

      {state.error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {state.error}
        </div>
      ) : null}

      {state.importedCount !== undefined ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-zinc-200 px-4 py-3 dark:border-zinc-800">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
              Imported
            </p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {state.importedCount}
            </p>
          </div>
          <div className="rounded-md border border-zinc-200 px-4 py-3 dark:border-zinc-800">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
              Duplicates
            </p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {state.skippedDuplicatesCount}
            </p>
          </div>
          <div className="rounded-md border border-zinc-200 px-4 py-3 dark:border-zinc-800">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
              Failed rows
            </p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {state.failedRowsCount}
            </p>
          </div>
        </div>
      ) : null}

      <button
        className="inline-flex h-11 items-center justify-center rounded-md bg-foreground px-5 text-sm font-medium text-background transition-colors hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Importing..." : "Import Products"}
      </button>
    </form>
  );
}
