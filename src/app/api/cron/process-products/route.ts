import { NextResponse } from "next/server";
import { processNextProduct } from "@/app/admin/products/actions";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await processNextProduct();
  const status = result.error ? 500 : 200;

  return NextResponse.json(result, { status });
}

export async function POST() {
  return GET();
}
