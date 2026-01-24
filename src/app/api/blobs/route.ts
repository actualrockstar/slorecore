import { list } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function GET() {
  const response = await list(); // uses server env var
  return NextResponse.json(response.blobs);
}
