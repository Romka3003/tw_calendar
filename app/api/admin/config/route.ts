import { NextRequest, NextResponse } from "next/server";
import {
  isDemoMode,
  getTeamMembersFromDb,
  getTeamMembersFromDbWithError,
  getNumDesksFromDb,
  getAllDesksFromDb,
} from "@/lib/db";
import { TEAM_MEMBERS } from "@/lib/team";

export const dynamic = "force-dynamic";

const MAX_DESKS = 12;

export async function GET(request: NextRequest) {
  try {
    const demo = isDemoMode();
    const debug = request.nextUrl.searchParams.get("debug") === "1";

    let teamMembers: { id: number; name: string; desired_days: number }[];
    let teamError: string | undefined;
    if (demo) {
      teamMembers = TEAM_MEMBERS.map((m, i) => ({ id: i + 1, name: m.name, desired_days: m.desiredDays }));
    } else if (debug) {
      const result = await getTeamMembersFromDbWithError();
      teamMembers = result.members;
      teamError = result.error;
    } else {
      teamMembers = await getTeamMembersFromDb();
    }

    const numDesks = demo ? 6 : await getNumDesksFromDb();
    const allDesksRaw = demo
      ? Array.from({ length: MAX_DESKS }, (_, i) => ({ id: i + 1, name: `Стол ${i + 1}` }))
      : await getAllDesksFromDb();
    const allDesks = [...allDesksRaw];
    while (allDesks.length < numDesks) {
      allDesks.push({ id: allDesks.length + 1, name: `Стол ${allDesks.length + 1}` });
    }
    const desks = allDesks.slice(0, numDesks);
    const payload: Record<string, unknown> = {
      teamMembers,
      numDesks,
      desks,
      demo,
    };
    if (debug) {
      payload.debug = {
        ...(teamError !== undefined && { teamError }),
        ...(teamError === undefined && teamMembers.length === 0 && !demo && { hint: "Query OK but 0 rows — check Vercel env POSTGRES_URL points to the same Neon project where you ran migrate_admin.sql" }),
      };
    }
    const response = NextResponse.json(payload);
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
  } catch (e) {
    console.error("GET /api/admin/config", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
