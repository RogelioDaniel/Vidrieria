import { NextRequest, NextResponse } from "next/server";
import { atelierProjects } from "@/data/atelier-content";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const projects = atelierProjects.filter(
    (project) =>
      !category || category === "all" || project.category === category
  );

  return NextResponse.json({ projects });
}
