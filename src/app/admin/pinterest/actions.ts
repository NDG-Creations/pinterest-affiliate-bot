"use server";

export type PinterestBoard = {
  id: string;
  name: string;
};

export type FetchPinterestBoardsState = {
  boards?: PinterestBoard[];
  error?: string;
};

type PinterestBoardsResponse = {
  items?: Array<{
    id?: unknown;
    name?: unknown;
  }>;
};

export async function fetchPinterestBoards(): Promise<FetchPinterestBoardsState> {
  const accessToken = process.env.PINTEREST_ACCESS_TOKEN?.trim();

  console.info("Pinterest access token exists:", Boolean(accessToken));

  if (!accessToken) {
    return { error: "Missing Pinterest access token." };
  }

  try {
    const response = await fetch("https://api.pinterest.com/v5/boards", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    console.info("Pinterest boards response status:", response.status);

    if (!response.ok) {
      const responseBody = await response.text();

      console.error("Pinterest boards failed response body:", responseBody);

      if (response.status === 401) {
        const body = responseBody.toLowerCase();
        const isExpired =
          body.includes("expired") ||
          body.includes("token_expired") ||
          body.includes("invalid_token");

        return {
          error: isExpired
            ? "Pinterest access token is expired. Generate a new token and update PINTEREST_ACCESS_TOKEN."
            : "Pinterest access token is unauthorized. Check that the token is valid and has board access.",
        };
      }

      return {
        error: `Pinterest API request failed: ${response.status} ${response.statusText}`,
      };
    }

    const data = (await response.json()) as PinterestBoardsResponse;
    const boards =
      data.items
        ?.map((board) => ({
          id: typeof board.id === "string" ? board.id : "",
          name: typeof board.name === "string" ? board.name : "Untitled board",
        }))
        .filter((board) => board.id) ?? [];

    return { boards };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    console.error("Pinterest boards fetch failed:", error);

    return { error: `Pinterest API request failed: ${message}` };
  }
}
