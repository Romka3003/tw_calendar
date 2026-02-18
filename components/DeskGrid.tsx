"use client";

import { useMemo } from "react";

export type BookingEntry = {
  desk_id: number;
  date: string;
  booked_by: string;
  note: string | null;
};

export type DeskGridProps = {
  dates: string[];
  desks: { id: number; name: string }[];
  bookings: BookingEntry[];
  userName: string;
  onBook: (deskId: number, date: string) => void;
  onUnbook: (deskId: number, date: string) => void;
  bookingPending?: { deskId: number; date: string } | null;
};

const DAY_LABELS = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const day = d.getDay();
  const dayNum = dateStr.slice(8);
  const month = dateStr.slice(5, 7);
  return `${DAY_LABELS[day]} ${dayNum}.${month}`;
}

export function DeskGrid({
  dates,
  desks,
  bookings,
  userName,
  onBook,
  onUnbook,
  bookingPending = null,
}: DeskGridProps) {
  const bookingMap = useMemo(() => {
    const map = new Map<string, BookingEntry>();
    for (const b of bookings) {
      map.set(`${b.desk_id}-${b.date}`, b);
    }
    return map;
  }, [bookings]);

  return (
    <>
      {/* Desktop: grid 7 rows (days) x 6 cols (desks) */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[600px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="border border-zinc-200 bg-zinc-50 p-2 text-left font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                День
              </th>
              {desks.map((d) => (
                <th
                  key={d.id}
                  className="border border-zinc-200 bg-zinc-50 p-2 text-center font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  {d.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dates.map((date) => {
              const dayBookings = desks.map((desk) => {
                const key = `${desk.id}-${date}`;
                return bookingMap.get(key);
              });
              const freeCount = dayBookings.filter((b) => !b).length;
              return (
                <tr key={date}>
                  <td className="border border-zinc-200 p-2 dark:border-zinc-700">
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {formatDateLabel(date)}
                    </span>
                    <br />
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      Свободно {freeCount} из 6
                    </span>
                  </td>
                  {desks.map((desk) => {
                    const key = `${desk.id}-${date}`;
                    const b = bookingMap.get(key);
                    const isPending =
                      bookingPending?.deskId === desk.id &&
                      bookingPending?.date === date;
                    return (
                      <td
                        key={desk.id}
                        className="border border-zinc-200 p-2 dark:border-zinc-700"
                      >
                        {b ? (
                          <div className="flex flex-col gap-1">
                            <span className="text-zinc-600 dark:text-zinc-400">
                              Занято: {b.booked_by}
                            </span>
                            {userName.trim() === b.booked_by && (
                              <button
                                type="button"
                                onClick={() => onUnbook(desk.id, date)}
                                className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-200 dark:hover:bg-amber-900/50"
                              >
                                Освободить
                              </button>
                            )}
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => onBook(desk.id, date)}
                            className="w-full rounded border border-emerald-200 bg-emerald-50 px-2 py-2 text-xs font-medium text-emerald-800 hover:bg-emerald-100 disabled:opacity-50 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200 dark:hover:bg-emerald-900/50"
                          >
                            {isPending ? "…" : "Забронировать"}
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile: list by days, cards with 6 desks */}
      <div className="space-y-4 md:hidden">
        {dates.map((date) => {
          const dayBookings = desks.map((desk) => {
            const key = `${desk.id}-${date}`;
            return { desk, booking: bookingMap.get(key) };
          });
          const freeCount = dayBookings.filter((d) => !d.booking).length;
          return (
            <div
              key={date}
              className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              <div className="mb-3 flex justify-between">
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {formatDateLabel(date)}
                </span>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  Свободно {freeCount} из 6
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {dayBookings.map(({ desk, booking }) => {
                  const isPending =
                    bookingPending?.deskId === desk.id &&
                    bookingPending?.date === date;
                  return (
                    <div
                      key={desk.id}
                      className="rounded-lg border border-zinc-100 p-3 dark:border-zinc-700"
                    >
                      <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        {desk.name}
                      </div>
                      {booking ? (
                        <div className="mt-1">
                          <span className="text-sm text-zinc-700 dark:text-zinc-300">
                            {booking.booked_by}
                          </span>
                          {userName.trim() === booking.booked_by && (
                            <button
                              type="button"
                              onClick={() => onUnbook(desk.id, date)}
                              className="mt-1 block text-xs text-amber-600 hover:underline dark:text-amber-400"
                            >
                              Освободить
                            </button>
                          )}
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => onBook(desk.id, date)}
                          className="mt-1 rounded bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-200 dark:hover:bg-emerald-900/60"
                        >
                          {isPending ? "…" : "Забронировать"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
