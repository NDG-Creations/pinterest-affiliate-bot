"use client";

import { useActionState } from "react";
import {
  fetchPinterestBoards,
  type FetchPinterestBoardsState,
} from "./actions";

const initialState: FetchPinterestBoardsState = {};

export function PinterestBoardsPanel() {
  const [state, formAction, isPending] = useActionState(
    fetchPinterestBoards,
    initialState,
  );

  return (
    <div className="mt-8 space-y-6">
      <form action={formAction}>
        <button
          className="inline-flex h-11 items-center justify-center rounded-md bg-foreground px-5 text-sm font-medium text-background transition-colors hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Fetching..." : "Fetch Pinterest Boards"}
        </button>
      </form>

      {state.error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {state.error}
        </div>
      ) : null}

      {state.boards ? (
        <div className="overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-800">
          {state.boards.length > 0 ? (
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-zinc-50 text-zinc-600 dark:bg-zinc-950 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Board name</th>
                  <th className="px-4 py-3 font-medium">Board id</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {state.boards.map((board) => (
                  <tr key={board.id}>
                    <td className="px-4 py-4 font-medium text-foreground">
                      {board.name}
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                      {board.id}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-4 py-12 text-center">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                No boards returned by Pinterest.
              </p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
