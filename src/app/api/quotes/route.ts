import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { computeQuote } from "@/lib/quote";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, productSlug, width, height, finish } = body as {
      name?: string;
      email?: string;
      phone?: string;
      productSlug?: string;
      width?: number;
      height?: number;
      finish?: string;
    };

    if (!name || !email || !phone || !productSlug || !width || !height || !finish) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios." },
        { status: 400 }
      );
    }
    if (width < 10 || height < 10 || width > 600 || height > 600) {
      return NextResponse.json(
        { error: "Las medidas deben estar entre 10 y 600 cm." },
        { status: 400 }
      );
    }

    const product = await db.product.findUnique({ where: { slug: productSlug } });
    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado." }, { status: 404 });
    }

    const { total, areaM2 } = computeQuote({
      pricePerM2: product.pricePerM2,
      widthCm: Number(width),
      heightCm: Number(height),
      finish,
    });

    const quote = await db.quote.create({
      data: {
        name,
        email,
        phone,
        productSlug,
        productName: product.name,
        width: Number(width),
        height: Number(height),
        finish,
        estimatedPrice: total,
        status: "nueva",
      },
    });

    return NextResponse.json({
      ok: true,
      quoteId: quote.id,
      estimatedPrice: total,
      areaM2: Number(areaM2.toFixed(2)),
      product: product.name,
    });
  } catch (err) {
    console.error("POST /api/quotes error", err);
    return NextResponse.json(
      { error: "No se pudo registrar la cotización." },
      { status: 500 }
    );
  }
}
