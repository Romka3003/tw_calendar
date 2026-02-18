import { NextRequest, NextResponse } from "next/server";
import { getWorkWeekDates } from "@/lib/date";
import {
  DESKS,
  getBookingsForDates,
  isDemoMode,
  getDesksFromDb,
  getTeamMembersFromDb,
} from "@/lib/db";
import { TEAM_MEMBERS, getBookedCountForMember } from "@/lib/team";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const tzOffsetMinutes = Number(request.nextUrl.searchParams.get("tzOffsetMinutes"));
    if (Number.isNaN(tzOffsetMinutes)) {
      return NextResponse.json(
        { error: "tzOffsetMinutes required" },
        { status: 400 }
      );
    }
    const dates = getWorkWeekDates(tzOffsetMinutes);
    const bookings = await getBookingsForDates(dates);
    const toDateOnly = (d: string | Date) =>
      typeof d === "string" ? d.slice(0, 10) : (d as Date).toISOString().slice(0, 10);
    const bookingsList = bookings.map((b) => ({
      desk_id: b.desk_id,
      date: toDateOnly(b.date),
      booked_by: b.booked_by,
      note: b.note,
    }));

    const demo = isDemoMode();
    const desks = demo ? DESKS : await getDesksFromDb();
    const teamRows = demo
      ? TEAM_MEMBERS.map((m) => ({ name: m.name, desired_days: m.desiredDays }))
      : await getTeamMembersFromDb();
    const teamMembers = teamRows.map((m) => ({
      name: m.name,
      desiredDays: m.desired_days,
      bookedCount: getBookedCountForMember(m.name, bookings),
    }));

    return NextResponse.json({
      dates,
      desks,
      bookings: bookingsList,
      teamMembers,
      demo,
    });
  } catch (e) {
    console.error("GET /api/week", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
