"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { generatePinImage, type GeneratePinImageState } from "./actions";

const initialState: GeneratePinImageState = {};

export function GeneratePinImageButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    generatePinImage,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [router, state.success]);

  return (
    <form action={formAction} className="space-y-2">
      <input name="productId" type="hidden" value={productId} />
      <button
        className="inline-flex h-9 items-center justify-center rounded-md border border-zinc-300 px-3 text-xs font-medium text-foreground transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:hover:bg-zinc-900"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Generating..." : "Generate Pin Image"}
      </button>
      {state.error ? <p className="text-xs text-red-600">{state.error}</p> : null}
      {state.success ? (
        <p className="text-xs text-emerald-700 dark:text-emerald-300">
          {state.success}
        </p>
      ) : null}
    </form>
  );
}
