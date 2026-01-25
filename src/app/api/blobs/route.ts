import { list } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function GET() {
  const response = await list({
    prefix: "pics/", // 👈 ONLY files in /pics
  });

  const images = response.blobs.filter((blob) =>
    blob.pathname.match(/\.(png|jpe?g|webp|gif)$/i)
  );

  return NextResponse.json(images);
}
