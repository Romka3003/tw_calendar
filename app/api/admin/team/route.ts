import { NextRequest, NextResponse } from "next/server";
import { isDemoMode, addTeamMemberToDb, getTeamMembersFromDbWithError } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (isDemoMode()) {
    return NextResponse.json({ error: "В демо-режиме нельзя добавлять участников" }, { status: 400 });
  }
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const desiredDays = Math.max(0, Math.min(7, Number(body.desiredDays) || 0));
    if (name.length < 2 || name.length > 80) {
      return NextResponse.json({ error: "Фамилия от 2 до 80 символов" }, { status: 400 });
    }
    const row = await addTeamMemberToDb(name, desiredDays);
    if (!row) return NextResponse.json({ error: "Не удалось добавить" }, { status: 500 });
    // В том же запросе загружаем список — то же подключение, список гарантированно виден
    const { members: teamMembers } = await getTeamMembersFromDbWithError();
    return NextResponse.json({ id: row.id, teamMembers });
  } catch (e) {
    console.error("POST /api/admin/team", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
