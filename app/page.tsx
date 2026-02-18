"use client";

import { useCallback, useEffect, useState } from "react";
import { DeskWeekGrid, type BookingEntry } from "@/components/DeskWeekGrid";
import { TeamSidebar } from "@/components/TeamSidebar";
import Link from "next/link";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

type TeamMemberRow = {
  name: string;
  desiredDays: number;
  bookedCount: number;
};

type WeekData = {
  dates: string[];
  desks: { id: number; name: string }[];
  bookings: BookingEntry[];
  teamMembers: TeamMemberRow[];
  demo?: boolean;
};

export default function Home() {
  const [weekData, setWeekData] = useState<WeekData | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const tzOffsetMinutes =
    typeof window !== "undefined" ? new Date().getTimezoneOffset() : 0;

  const fetchWeek = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/week?tzOffsetMinutes=${encodeURIComponent(tzOffsetMinutes)}`
      );
      if (!res.ok) throw new Error("Ошибка загрузки");
      const data: WeekData = await res.json();
      setWeekData(data);
    } catch {
      setMessage({ type: "err", text: "Не удалось загрузить данные" });
    } finally {
      setLoading(false);
    }
  }, [tzOffsetMinutes]);

  useEffect(() => {
    fetchWeek();
  }, [fetchWeek]);

  const showMessage = (type: "ok" | "err", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleBook = async (deskId: number, date: string, bookedBy: string) => {
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deskId,
          date,
          bookedBy,
          note: null,
          tzOffsetMinutes,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showMessage("ok", "Забронировано");
        fetchWeek();
      } else if (res.status === 409) {
        showMessage("err", "Уже занято");
        fetchWeek();
      } else {
        showMessage("err", data.error || "Ошибка");
        fetchWeek();
      }
    } catch {
      showMessage("err", "Ошибка сети");
      fetchWeek();
    }
  };

  const handleUnbook = async (deskId: number, date: string, bookedBy: string) => {
    try {
      const res = await fetch("/api/unbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deskId, date, bookedBy }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showMessage("ok", "Бронь снята");
        fetchWeek();
      } else {
        showMessage("err", data.error || "Ошибка");
        fetchWeek();
      }
    } catch {
      showMessage("err", "Ошибка сети");
      fetchWeek();
    }
  };

  return (
    <div className="min-h-screen bg-vas3k-bg">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-[var(--vas3k-text-bright)]">
              Бронирование столов
            </h1>
            {weekData?.demo && (
              <span
                className="rounded px-2 py-0.5 text-sm"
                style={{ backgroundColor: "rgba(255, 196, 85, 0.91)", color: "#333" }}
              >
                Демо
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="text-sm text-[var(--vas3k-text)] underline hover:no-underline"
            >
              Настройки
            </Link>
            <ThemeSwitcher />
          </div>
        </header>

        {loading ? (
          <p className="text-[var(--vas3k-text)] opacity-80">Загрузка…</p>
        ) : weekData ? (
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <div
              className="min-w-0 flex-1 rounded-vas3k p-6 shadow-vas3k"
              style={{
                backgroundColor: "var(--vas3k-block-bg)",
                border: "var(--vas3k-block-border)",
              }}
            >
              <DeskWeekGrid
                dates={weekData.dates}
                desks={weekData.desks}
                bookings={weekData.bookings}
                teamNames={weekData.teamMembers.map((m) => m.name)}
                onBook={handleBook}
                onUnbook={handleUnbook}
              />
            </div>
            <div className="w-full min-w-0 shrink-0 lg:w-[22rem]">
              <TeamSidebar members={weekData.teamMembers} />
            </div>
          </div>
        ) : (
          <p className="text-[var(--vas3k-text)] opacity-80">
            Нет данных. Проверьте подключение к БД.
          </p>
        )}

        <div
          className="min-h-[2.75rem] py-2"
          aria-live="polite"
          aria-atomic="true"
        >
          {message && (
            <div
              role="alert"
              className="rounded-vas3k px-4 py-2 text-sm"
              style={{
                backgroundColor:
                  message.type === "ok"
                    ? "rgba(83, 170, 104, 0.25)"
                    : "rgba(255, 25, 23, 0.15)",
                color: "var(--vas3k-text-bright)",
              }}
            >
              {message.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
