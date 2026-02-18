import { NextRequest, NextResponse } from "next/server";
import { getWorkWeekDates } from "@/lib/date";
import { DESKS, getBookingsForDates, isDemoMode } from "@/lib/db";
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
    const bookingsList = bookings.map((b) => ({
      desk_id: b.desk_id,
      date: b.date,
      booked_by: b.booked_by,
      note: b.note,
    }));
    const teamMembers = TEAM_MEMBERS.map((m) => ({
      name: m.name,
      desiredDays: m.desiredDays,
      bookedCount: getBookedCountForMember(m.name, bookings),
    }));
    return NextResponse.json({
      dates,
      desks: DESKS,
      bookings: bookingsList,
      teamMembers,
      demo: isDemoMode(),
    });
  } catch (e) {
    console.error("GET /api/week", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
