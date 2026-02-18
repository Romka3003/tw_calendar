import { NextResponse } from "next/server";
import {
  isDemoMode,
  getTeamMembersFromDb,
  getNumDesksFromDb,
  getAllDesksFromDb,
} from "@/lib/db";
import { TEAM_MEMBERS } from "@/lib/team";

export const dynamic = "force-dynamic";

const MAX_DESKS = 12;

export async function GET() {
  try {
    const demo = isDemoMode();
    const teamMembers = demo
      ? TEAM_MEMBERS.map((m, i) => ({ id: i + 1, name: m.name, desired_days: m.desiredDays }))
      : await getTeamMembersFromDb();
    const numDesks = demo ? 6 : await getNumDesksFromDb();
    const allDesksRaw = demo
      ? Array.from({ length: MAX_DESKS }, (_, i) => ({ id: i + 1, name: `Стол ${i + 1}` }))
      : await getAllDesksFromDb();
    const allDesks = [...allDesksRaw];
    while (allDesks.length < numDesks) {
      allDesks.push({ id: allDesks.length + 1, name: `Стол ${allDesks.length + 1}` });
    }
    const desks = allDesks.slice(0, numDesks);
    return NextResponse.json({
      teamMembers,
      numDesks,
      desks,
      demo,
    });
  } catch (e) {
    console.error("GET /api/admin/config", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
