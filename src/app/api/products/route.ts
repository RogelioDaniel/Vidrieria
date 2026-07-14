import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");

    const where: Record<string, unknown> = {};
    if (category && category !== "all") where.category = category;
    if (featured === "true") where.featured = true;

    const products = await db.product.findMany({
      where,
      orderBy: [{ featured: "desc" }, { category: "asc" }, { name: "asc" }],
    });

    return NextResponse.json({ products });
  } catch (err) {
    console.error("GET /api/products error", err);
    return NextResponse.json(
      { error: "No se pudieron obtener los productos." },
      { status: 500 }
    );
  }
}
