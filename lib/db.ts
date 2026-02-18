import { sql } from "@vercel/postgres";

export const DESK_IDS = [1, 2, 3, 4, 5, 6] as const;
export type DeskId = (typeof DESK_IDS)[number];

export interface Desk {
  id: number;
  name: string;
}

export interface Booking {
  desk_id: number;
  date: string;
  booked_by: string;
  note: string | null;
}

export const DESKS: Desk[] = DESK_IDS.map((id) => ({ id, name: `Стол ${id}` }));

// --- Демо-режим (без БД): in-memory хранилище с заведёнными данными ---
const demoStore = new Map<string, Booking>();

function demoKey(deskId: number, date: string) {
  return `${deskId}-${date}`;
}

/** Заполняет демо-данные на рабочую неделю (пн–пт) при первом запросе */
function ensureDemoSeed(dates: string[]) {
  if (demoStore.size > 0) return;
  const seed: { desk_id: number; dateIdx: number; booked_by: string; note: string | null }[] = [
    { desk_id: 1, dateIdx: 0, booked_by: "Бикташов", note: null },
    { desk_id: 2, dateIdx: 0, booked_by: "Ковзель", note: null },
    { desk_id: 3, dateIdx: 0, booked_by: "Перфильева", note: null },
    { desk_id: 1, dateIdx: 1, booked_by: "Бикташов", note: null },
    { desk_id: 2, dateIdx: 1, booked_by: "Малинова", note: null },
    { desk_id: 3, dateIdx: 1, booked_by: "Перфильева", note: null },
    { desk_id: 2, dateIdx: 2, booked_by: "Малинова", note: null },
    { desk_id: 3, dateIdx: 2, booked_by: "Самодова", note: null },
    { desk_id: 1, dateIdx: 3, booked_by: "Крутицкая", note: null },
    { desk_id: 2, dateIdx: 3, booked_by: "Ковзель", note: null },
    { desk_id: 3, dateIdx: 3, booked_by: "Воронцова", note: null },
    { desk_id: 2, dateIdx: 4, booked_by: "Раззаков", note: null },
    { desk_id: 3, dateIdx: 4, booked_by: "Антипина", note: null },
  ];
  for (const s of seed) {
    const date = dates[s.dateIdx];
    if (date) {
      demoStore.set(demoKey(s.desk_id, date), {
        desk_id: s.desk_id,
        date,
        booked_by: s.booked_by,
        note: s.note,
      });
    }
  }
}

/** Демо-режим: нет БД или в .env указан плейсхолдер (невалидная строка подключения) */
export function isDemoMode(): boolean {
  const url = process.env.POSTGRES_URL ?? "";
  if (!url) return true;
  // Плейсхолдер из инструкций — не пытаемся подключаться к БД
  if (url.includes("user:password@host") || url.includes("/database?")) return true;
  return false;
}

export async function getBookingsForDates(dates: string[]): Promise<Booking[]> {
  if (dates.length === 0) return [];
  if (isDemoMode()) {
    ensureDemoSeed(dates);
    const start = dates[0];
    const end = dates[dates.length - 1];
    const result = Array.from(demoStore.values()).filter(
      (b) => b.date >= start && b.date <= end
    );
    result.sort((a, b) => (a.date === b.date ? a.desk_id - b.desk_id : a.date.localeCompare(b.date)));
    return result;
  }
  const start = dates[0];
  const end = dates[dates.length - 1];
  const result = await sql<Booking>`
    SELECT desk_id, date::text, booked_by, note
    FROM bookings
    WHERE date >= ${start}::date AND date <= ${end}::date
    ORDER BY date, desk_id
  `;
  return result.rows;
}

export async function createBooking(
  deskId: number,
  date: string,
  bookedBy: string,
  note: string | null
): Promise<{ ok: boolean }> {
  if (isDemoMode()) {
    const key = demoKey(deskId, date);
    if (demoStore.has(key)) return { ok: false };
    demoStore.set(key, { desk_id: deskId, date, booked_by: bookedBy, note });
    return { ok: true };
  }
  const result = await sql`
    INSERT INTO bookings (desk_id, date, booked_by, note)
    VALUES (${deskId}, ${date}::date, ${bookedBy}, ${note ?? null})
    ON CONFLICT (desk_id, date) DO NOTHING
    RETURNING id
  `;
  return { ok: result.rowCount === 1 };
}

export async function deleteBooking(
  deskId: number,
  date: string,
  bookedBy: string
): Promise<{ deleted: boolean }> {
  if (isDemoMode()) {
    const key = demoKey(deskId, date);
    const b = demoStore.get(key);
    if (!b || b.booked_by !== bookedBy) return { deleted: false };
    demoStore.delete(key);
    return { deleted: true };
  }
  const result = await sql`
    DELETE FROM bookings
    WHERE desk_id = ${deskId} AND date = ${date}::date AND booked_by = ${bookedBy}
    RETURNING id
  `;
  return { deleted: result.rowCount === 1 };
}
