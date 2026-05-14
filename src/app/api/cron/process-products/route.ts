import { NextResponse } from "next/server";
import { processProductBatch } from "@/app/admin/products/actions";

export const dynamic = "force-dynamic";

const processCronRequest = async (request: Request) => {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured." },
      { status: 500 },
    );
  }

  const authorization = request.headers.get("authorization");

  if (authorization !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const result = await processProductBatch(3);

  return NextResponse.json(result);
};

export async function GET(request: Request) {
  return processCronRequest(request);
}

export async function POST(request: Request) {
  return processCronRequest(request);
}
