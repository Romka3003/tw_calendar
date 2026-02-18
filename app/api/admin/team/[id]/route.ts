import { NextRequest, NextResponse } from "next/server";
import { isDemoMode, updateTeamMemberInDb, deleteTeamMemberFromDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (isDemoMode()) {
    return NextResponse.json({ error: "Демо-режим" }, { status: 400 });
  }
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ error: "Некорректный id" }, { status: 400 });
  }
  try {
    const body = await request.json();
    const data: { name?: string; desired_days?: number } = {};
    if (typeof body.name === "string") data.name = body.name.trim();
    if (typeof body.desiredDays === "number") data.desired_days = Math.max(0, Math.min(7, body.desiredDays));
    const ok = await updateTeamMemberInDb(id, data);
    if (!ok) return NextResponse.json({ error: "Не удалось обновить" }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("PATCH /api/admin/team", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (isDemoMode()) {
    return NextResponse.json({ error: "Демо-режим" }, { status: 400 });
  }
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ error: "Некорректный id" }, { status: 400 });
  }
  try {
    const ok = await deleteTeamMemberFromDb(id);
    if (!ok) return NextResponse.json({ error: "Не удалось удалить" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/admin/team", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
