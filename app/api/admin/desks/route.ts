import { NextRequest, NextResponse } from "next/server";
import { isDemoMode, setNumDesksAndNames } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PUT(request: NextRequest) {
  if (isDemoMode()) {
    return NextResponse.json({ error: "В демо-режиме настройки столов недоступны" }, { status: 400 });
  }
  try {
    const body = await request.json();
    const numDesks = Math.max(1, Math.min(12, Number(body.numDesks) || 6));
    const rawDesks = Array.isArray(body.desks) ? body.desks : [];
    const names = rawDesks
      .filter((d: { id?: number; name?: string }) => d && Number.isInteger(Number(d.id)))
      .map((d: { id?: number; name?: string }) => ({
        id: Number(d.id),
        name: typeof d.name === "string" ? d.name.trim() || `Стол ${d.id}` : `Стол ${d.id}`,
      }));
    await setNumDesksAndNames(numDesks, names);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("PUT /api/admin/desks", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
