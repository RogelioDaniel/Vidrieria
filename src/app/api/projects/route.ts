import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const where: Record<string, unknown> = {};
    if (category && category !== "all") where.category = category;

    const projects = await db.project.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ projects });
  } catch (err) {
    console.error("GET /api/projects error", err);
    return NextResponse.json({ error: "Error." }, { status: 500 });
  }
}
