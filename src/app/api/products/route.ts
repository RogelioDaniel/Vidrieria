import { NextRequest, NextResponse } from "next/server";
import { atelierProducts } from "@/data/atelier-content";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const featured = searchParams.get("featured");

  const products = atelierProducts
    .filter(
      (product) =>
        (!category || category === "all" || product.category === category) &&
        (featured !== "true" || product.featured)
    )
    .sort(
      (a, b) =>
        Number(b.featured) - Number(a.featured) ||
        a.category.localeCompare(b.category, "es") ||
        a.name.localeCompare(b.name, "es")
    );

  return NextResponse.json({ products });
}
