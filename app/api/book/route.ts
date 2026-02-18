import { NextRequest, NextResponse } from "next/server";
import { getWorkWeekDates, isDateInRange } from "@/lib/date";
import { createBooking } from "@/lib/db";

function validateBookedBy(bookedBy: unknown): string | null {
  if (typeof bookedBy !== "string") return null;
  const trimmed = bookedBy.trim();
  if (trimmed.length < 2 || trimmed.length > 40) return null;
  return trimmed;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deskId, date, bookedBy: rawBookedBy, note } = body;

    const bookedBy = validateBookedBy(rawBookedBy);
    if (!bookedBy) {
      return NextResponse.json(
        { error: "Имя обязательно: от 2 до 40 символов" },
        { status: 400 }
      );
    }

    const deskIdNum = Number(deskId);
    if (!Number.isInteger(deskIdNum) || deskIdNum < 1 || deskIdNum > 6) {
      return NextResponse.json(
        { error: "deskId должен быть от 1 до 6" },
        { status: 400 }
      );
    }

    if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: "Некорректная дата" },
        { status: 400 }
      );
    }

    const tzOffsetMinutes = Number(body.tzOffsetMinutes);
    if (Number.isNaN(tzOffsetMinutes)) {
      return NextResponse.json(
        { error: "tzOffsetMinutes required" },
        { status: 400 }
      );
    }
    const weekDates = getWorkWeekDates(tzOffsetMinutes);
    const weekStart = weekDates[0];
    const weekEnd = weekDates[4];
    if (!isDateInRange(date, weekStart, weekEnd)) {
      return NextResponse.json(
        { error: "Дата должна быть в пределах отображаемой недели" },
        { status: 400 }
      );
    }

    const noteStr =
      note != null && typeof note === "string"
        ? note.trim().slice(0, 140)
        : null;

    const { ok } = await createBooking(deskIdNum, date, bookedBy, noteStr);
    if (!ok) {
      return NextResponse.json(
        { error: "Уже занято" },
        { status: 409 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("POST /api/book", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
