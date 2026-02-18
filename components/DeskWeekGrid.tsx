"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type BookingEntry = {
  desk_id: number;
  date: string;
  booked_by: string;
  note: string | null;
};

const DAY_LABELS = ["пн", "вт", "ср", "чт", "пт"];

type OpenCellState = {
  deskId: number;
  date: string;
  rect: DOMRect;
};

export type DeskWeekGridProps = {
  dates: string[];
  desks: { id: number; name: string }[];
  bookings: BookingEntry[];
  teamNames: string[];
  onBook: (deskId: number, date: string, bookedBy: string) => void;
  onUnbook: (deskId: number, date: string, bookedBy: string) => void;
};

export function DeskWeekGrid({
  dates,
  desks,
  bookings,
  teamNames,
  onBook,
  onUnbook,
}: DeskWeekGridProps) {
  const [openCell, setOpenCell] = useState<OpenCellState | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openCell) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (dropdownRef.current?.contains(target)) return;
      if (target.closest("[data-desk-cell]")) return;
      setOpenCell(null);
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => document.removeEventListener("click", handleClickOutside, true);
  }, [openCell]);

  const bookingMap = useMemo(() => {
    const map = new Map<string, BookingEntry>();
    const toKey = (d: string) => (d.length >= 10 ? d.slice(0, 10) : d);
    for (const b of bookings) {
      const dateKey = toKey(b.date);
      map.set(`${b.desk_id}-${dateKey}`, { ...b, date: dateKey });
    }
    return map;
  }, [bookings]);

  const handleSelect = (deskId: number, date: string, choice: string) => {
    const key = `${deskId}-${date}`;
    const current = bookingMap.get(key);
    if (choice === "__free__") {
      if (current) onUnbook(deskId, date, current.booked_by);
    } else {
      if (current && current.booked_by === choice) {
        setOpenCell(null);
        return;
      }
      if (current) onUnbook(deskId, date, current.booked_by);
      onBook(deskId, date, choice);
    }
    setOpenCell(null);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th
              className="border p-2 text-left font-medium"
              style={{
                borderColor: "var(--vas3k-input-border)",
                backgroundColor: "var(--vas3k-input-bg)",
                color: "var(--vas3k-text)",
              }}
            >
              День
            </th>
            {desks.map((d) => (
              <th
                key={d.id}
                className="border p-2 text-center font-medium"
                style={{
                  borderColor: "var(--vas3k-input-border)",
                  backgroundColor: "var(--vas3k-input-bg)",
                  color: "var(--vas3k-text)",
                }}
              >
                {d.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dates.map((date, dateIdx) => (
            <tr key={date}>
              <td
                className="border p-2 font-medium"
                style={{
                  borderColor: "var(--vas3k-input-border)",
                  backgroundColor: "var(--vas3k-bg)",
                  color: "var(--vas3k-text)",
                }}
              >
                {DAY_LABELS[dateIdx]}
              </td>
              {desks.map((desk) => {
                const key = `${desk.id}-${date}`;
                const booking = bookingMap.get(key);
                const isOpen =
                  openCell?.deskId === desk.id && openCell?.date === date;
                return (
                  <td
                    key={desk.id}
                    className="relative border p-0"
                    style={{ borderColor: "var(--vas3k-input-border)" }}
                    data-desk-cell
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        if (isOpen) {
                          setOpenCell(null);
                        } else {
                          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                          setOpenCell({ deskId: desk.id, date, rect });
                        }
                      }}
                      className="min-h-[44px] w-full px-2 py-2 text-center text-sm transition-[background-color,color] duration-200"
                      style={
                        booking
                          ? {
                              backgroundColor: "var(--vas3k-block-bg)",
                              color: "var(--vas3k-text)",
                            }
                          : {
                              backgroundColor: "var(--slot-free-bg)",
                              color: "var(--slot-free-text)",
                            }
                      }
                    >
                      {booking ? booking.booked_by : "свободно"}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {openCell &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={dropdownRef}
            className="fixed z-[9999] max-h-56 w-48 overflow-auto rounded-vas3k shadow-vas3k"
            style={{
              top: openCell.rect.bottom + 4,
              left: openCell.rect.left,
              backgroundColor: "var(--vas3k-block-bg)",
              border: "var(--vas3k-block-border)",
              boxShadow: "var(--vas3k-block-shadow)",
            }}
          >
            <button
              type="button"
              onClick={() => handleSelect(openCell.deskId, openCell.date, "__free__")}
              className="block w-full px-3 py-2 text-left text-sm transition-colors hover:opacity-80"
              style={{ color: "var(--slot-free-text)" }}
            >
              — Свободно —
            </button>
            {teamNames.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => handleSelect(openCell.deskId, openCell.date, name)}
                className="block w-full px-3 py-2 text-left text-sm transition-colors hover:opacity-80"
                style={{ color: "var(--vas3k-text)" }}
              >
                {name}
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}
