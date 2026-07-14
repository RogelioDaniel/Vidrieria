import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const appts = await db.appointment.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ appointments: appts });
  } catch (err) {
    console.error("GET /api/appointments error", err);
    return NextResponse.json({ error: "Error al leer citas." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, serviceType, date, time, address, notes } = body as {
      name?: string;
      email?: string;
      phone?: string;
      serviceType?: string;
      date?: string;
      time?: string;
      address?: string;
      notes?: string;
    };

    if (!name || !email || !phone || !serviceType || !date || !time || !address) {
      return NextResponse.json(
        { error: "Completa todos los campos obligatorios." },
        { status: 400 }
      );
    }

    const appointment = await db.appointment.create({
      data: {
        name,
        email,
        phone,
        serviceType,
        date,
        time,
        address,
        notes: notes ?? "",
        status: "solicitada",
      },
    });

    return NextResponse.json({ ok: true, appointmentId: appointment.id });
  } catch (err) {
    console.error("POST /api/appointments error", err);
    return NextResponse.json(
      { error: "No se pudo agendar la cita." },
      { status: 500 }
    );
  }
}
