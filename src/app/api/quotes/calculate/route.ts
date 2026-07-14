import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { computeQuote } from "@/lib/quote";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productSlug, width, height, finish } = body as {
      productSlug?: string;
      width?: number;
      height?: number;
      finish?: string;
    };

    if (!productSlug || !width || !height || !finish) {
      return NextResponse.json(
        { error: "Faltan datos para calcular." },
        { status: 400 }
      );
    }
    if (width < 10 || height < 10 || width > 600 || height > 600) {
      return NextResponse.json(
        { error: "Medidas fuera de rango (10–600 cm)." },
        { status: 400 }
      );
    }

    const product = await db.product.findUnique({ where: { slug: productSlug } });
    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado." }, { status: 404 });
    }

    const { total, areaM2, finishMultiplier } = computeQuote({
      pricePerM2: product.pricePerM2,
      widthCm: Number(width),
      heightCm: Number(height),
      finish,
    });

    return NextResponse.json({
      ok: true,
      estimatedPrice: total,
      areaM2: Number(areaM2.toFixed(2)),
      finishMultiplier,
      product: product.name,
      pricePerM2: product.pricePerM2,
    });
  } catch (err) {
    console.error("POST /api/quotes/calculate error", err);
    return NextResponse.json(
      { error: "No se pudo calcular el precio." },
      { status: 500 }
    );
  }
}
