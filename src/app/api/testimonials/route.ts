import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const testimonials = await db.testimonial.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ testimonials });
  } catch (err) {
    console.error("GET /api/testimonials error", err);
    return NextResponse.json({ error: "Error." }, { status: 500 });
  }
}
