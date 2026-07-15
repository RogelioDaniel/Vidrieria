import { NextResponse } from "next/server";
import { atelierTestimonials } from "@/data/atelier-content";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ testimonials: atelierTestimonials });
}
