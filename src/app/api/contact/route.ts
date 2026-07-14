import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body as {
      name?: string;
      email?: string;
      subject?: string;
      message?: string;
    };

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Completa todos los campos." },
        { status: 400 }
      );
    }

    const msg = await db.contactMessage.create({
      data: { name, email, subject, message },
    });

    return NextResponse.json({ ok: true, id: msg.id });
  } catch (err) {
    console.error("POST /api/contact error", err);
    return NextResponse.json(
      { error: "No se pudo enviar el mensaje." },
      { status: 500 }
    );
  }
}
