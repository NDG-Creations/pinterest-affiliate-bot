"use client";

import { useState } from "react";

type CopyFieldProps = {
  label: string;
  value: string;
  multiline?: boolean;
};

export function CopyField({ label, value, multiline = false }: CopyFieldProps) {
  const [copied, setCopied] = useState(false);

  const copyValue = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const fieldClassName =
    "mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50";

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
          {label}
        </label>
        <button
          className="inline-flex h-8 items-center justify-center rounded-md border border-zinc-300 px-3 text-xs font-medium text-foreground transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          onClick={copyValue}
          type="button"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      {multiline ? (
        <textarea className={fieldClassName} readOnly rows={7} value={value} />
      ) : (
        <input className={fieldClassName} readOnly value={value} />
      )}
    </div>
  );
}
