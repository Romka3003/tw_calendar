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

export interface TeamMemberRow {
  id: number;
  name: string;
  desired_days: number;
}

const MAX_DESKS = 12;

// --- Админка: загрузка из БД (при !isDemoMode) ---
export async function getTeamMembersFromDb(): Promise<TeamMemberRow[]> {
  const { members } = await getTeamMembersFromDbWithError();
  return members;
}

/** Для отладки: возвращает список и текст ошибки (если был). */
export async function getTeamMembersFromDbWithError(): Promise<{
  members: TeamMemberRow[];
  error?: string;
}> {
  try {
    const r = await sql<{ id: number; name: string; desired_days: number }>`
      SELECT id, name, desired_days FROM team_members ORDER BY id
    `;
    // @vercel/postgres с fullResults даёт .rows; иногда драйвер возвращает массив напрямую
    const withRows = r as { rows?: TeamMemberRow[] };
    const members =
      Array.isArray(withRows.rows) ? withRows.rows
      : Array.isArray(r) ? (r as unknown as TeamMemberRow[])
      : [];
    return { members };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[getTeamMembersFromDb]", e);
    return { members: [], error: msg };
  }
}

export async function getNumDesksFromDb(): Promise<number> {
  try {
    const r = await sql<{ value: string }>`SELECT value FROM settings WHERE key = 'num_desks'`;
    const v = r.rows[0]?.value;
    const n = parseInt(v ?? "6", 10);
    return Math.min(MAX_DESKS, Math.max(1, isNaN(n) ? 6 : n));
  } catch {
    return 6;
  }
}

export async function getDesksFromDb(): Promise<Desk[]> {
  try {
    const num = await getNumDesksFromDb();
    const r = await sql<{ id: number; name: string }>`
      SELECT id, name FROM desks WHERE id <= ${num} ORDER BY id
    `;
    return r.rows;
  } catch {
    return DESKS;
  }
}

export async function setNumDesksAndNames(numDesks: number, names: { id: number; name: string }[]): Promise<void> {
  const n = Math.min(MAX_DESKS, Math.max(1, numDesks));
  await sql`UPDATE settings SET value = ${String(n)} WHERE key = 'num_desks'`;
  const nameMap = new Map(names.map((d) => [d.id, d.name]));
  for (let id = 1; id <= n; id++) {
    const name = nameMap.get(id) ?? `Стол ${id}`;
    await sql`INSERT INTO desks (id, name) VALUES (${id}, ${name})
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name`;
  }
}

export async function addTeamMemberToDb(name: string, desiredDays: number): Promise<{ id: number } | null> {
  try {
    const r = await sql<{ id: number }>`
      INSERT INTO team_members (name, desired_days) VALUES (${name.trim()}, ${desiredDays})
      RETURNING id
    `;
    return r.rows[0] ?? null;
  } catch {
    return null;
  }
}

export async function updateTeamMemberInDb(id: number, data: { name?: string; desired_days?: number }): Promise<boolean> {
  try {
    if (data.name !== undefined) {
      await sql`UPDATE team_members SET name = ${data.name.trim()} WHERE id = ${id}`;
    }
    if (data.desired_days !== undefined) {
      await sql`UPDATE team_members SET desired_days = ${data.desired_days} WHERE id = ${id}`;
    }
    return true;
  } catch {
    return false;
  }
}

export async function deleteTeamMemberFromDb(id: number): Promise<boolean> {
  try {
    const r = await sql`DELETE FROM team_members WHERE id = ${id} RETURNING id`;
    return (r.rowCount ?? 0) > 0;
  } catch {
    return false;
  }
}

export async function getAllDesksFromDb(): Promise<Desk[]> {
  try {
    const r = await sql<{ id: number; name: string }>`SELECT id, name FROM desks ORDER BY id`;
    return r.rows;
  } catch {
    return Array.from({ length: 12 }, (_, i) => ({ id: i + 1, name: `Стол ${i + 1}` }));
  }
}

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
  const result = await sql<{ desk_id: number; date: string | Date; booked_by: string; note: string | null }>`
    SELECT desk_id, date, booked_by, note
    FROM bookings
    WHERE date >= ${start}::date AND date <= ${end}::date
    ORDER BY date, desk_id
  `;
  const toDateOnly = (d: string | Date): string =>
    typeof d === "string" ? d.slice(0, 10) : d.toISOString().slice(0, 10);
  return result.rows.map((r) => ({
    desk_id: r.desk_id,
    date: toDateOnly(r.date),
    booked_by: r.booked_by,
    note: r.note,
  }));
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
