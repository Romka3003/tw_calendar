import { NextRequest, NextResponse } from "next/server";
import { deleteBooking } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deskId, date, bookedBy } = body;

    if (
      !Number.isInteger(Number(deskId)) ||
      Number(deskId) < 1 ||
      Number(deskId) > 6
    ) {
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
    if (typeof bookedBy !== "string" || !bookedBy.trim()) {
      return NextResponse.json(
        { error: "Имя обязательно" },
        { status: 400 }
      );
    }

    const { deleted } = await deleteBooking(
      Number(deskId),
      date,
      bookedBy.trim()
    );
    if (!deleted) {
      return NextResponse.json(
        {
          error:
            "Нельзя снять бронь: имя не совпадает или брони нет",
        },
        { status: 403 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("POST /api/unbook", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
