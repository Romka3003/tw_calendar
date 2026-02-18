"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type TeamMember = { id: number; name: string; desired_days: number };
type Desk = { id: number; name: string };

export default function AdminPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [numDesks, setNumDesks] = useState(6);
  const [desks, setDesks] = useState<Desk[]>([]);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [newName, setNewName] = useState("");
  const [newDesiredDays, setNewDesiredDays] = useState(2);
  const [saving, setSaving] = useState(false);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/config");
      const data = await res.json();
      if (res.ok) {
        setTeamMembers(data.teamMembers ?? []);
        setNumDesks(data.numDesks ?? 6);
        setDesks(data.desks ?? []);
        setDemo(!!data.demo);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const showMsg = (type: "ok" | "err", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const addMember = async () => {
    const name = newName.trim();
    if (name.length < 2) {
      showMsg("err", "Фамилия от 2 символов");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, desiredDays: newDesiredDays }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showMsg("ok", "Участник добавлен");
        setNewName("");
        setNewDesiredDays(2);
        fetchConfig();
      } else {
        showMsg("err", data.error || "Ошибка");
      }
    } finally {
      setSaving(false);
    }
  };

  const updateMember = async (id: number, field: "name" | "desired_days", value: string | number) => {
    if (demo) return;
    setSaving(true);
    try {
      const body = field === "name" ? { name: value } : { desiredDays: Number(value) };
      const res = await fetch(`/api/admin/team/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showMsg("ok", "Сохранено");
        fetchConfig();
      } else {
        showMsg("err", data.error || "Ошибка");
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteMember = async (id: number) => {
    if (demo) return;
    if (!confirm("Удалить участника?")) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/team/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showMsg("ok", "Удалено");
        fetchConfig();
      } else {
        showMsg("err", data.error || "Ошибка");
      }
    } finally {
      setSaving(false);
    }
  };

  const saveDesks = async () => {
    if (demo) return;
    const n = Math.max(1, Math.min(12, numDesks));
    const deskList = Array.from({ length: n }, (_, i) => ({
      id: i + 1,
      name: desks[i]?.name?.trim() || `Стол ${i + 1}`,
    }));
    setSaving(true);
    try {
      const res = await fetch("/api/admin/desks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numDesks: n, desks: deskList }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showMsg("ok", "Столы сохранены");
        setNumDesks(n);
        setDesks(deskList);
        fetchConfig();
      } else {
        showMsg("err", data.error || "Ошибка");
      }
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    setDesks((prev) => {
      const next = [...prev];
      while (next.length < numDesks) next.push({ id: next.length + 1, name: `Стол ${next.length + 1}` });
      return next.slice(0, numDesks);
    });
  }, [numDesks]);

  if (loading) {
    return (
      <div className="min-h-screen bg-vas3k-bg p-6">
        <p style={{ color: "var(--vas3k-text)" }}>Загрузка…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vas3k-bg p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[var(--vas3k-text-bright)]">Настройки</h1>
          <Link
            href="/"
            className="rounded-vas3k px-4 py-2 text-sm font-medium transition-colors"
            style={{
              backgroundColor: "var(--vas3k-button-bg)",
              color: "var(--vas3k-button-color)",
              border: "var(--vas3k-button-border)",
            }}
          >
            ← К бронированию
          </Link>
        </div>

        {message && (
          <div
            className="mb-4 rounded-vas3k px-4 py-2 text-sm"
            style={{
              backgroundColor: message.type === "ok" ? "rgba(83,170,104,0.25)" : "rgba(255,25,23,0.15)",
              color: "var(--vas3k-text-bright)",
            }}
          >
            {message.text}
          </div>
        )}

        {demo && (
          <p className="mb-4 text-sm" style={{ color: "var(--vas3k-text)" }}>
            Демо-режим: изменения не сохраняются. Подключите БД для настройки.
          </p>
        )}

        {/* Участники */}
        <section
          className="mb-8 rounded-vas3k p-6 shadow-vas3k"
          style={{ backgroundColor: "var(--vas3k-block-bg)", border: "var(--vas3k-block-border)" }}
        >
          <h2 className="mb-4 text-lg font-semibold text-[var(--vas3k-text-bright)]">
            1. Участники ({teamMembers.length})
          </h2>
          <div className="mb-4 flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="Фамилия"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="rounded-vas3k border px-3 py-2 text-sm"
              style={{
                borderColor: "var(--vas3k-input-border)",
                backgroundColor: "var(--vas3k-input-bg)",
                color: "var(--vas3k-text)",
              }}
            />
            <input
              type="number"
              min={0}
              max={7}
              value={newDesiredDays}
              onChange={(e) => setNewDesiredDays(Number(e.target.value) || 0)}
              className="w-20 rounded-vas3k border px-3 py-2 text-sm"
              style={{
                borderColor: "var(--vas3k-input-border)",
                backgroundColor: "var(--vas3k-input-bg)",
                color: "var(--vas3k-text)",
              }}
            />
            <span className="flex items-center text-sm text-[var(--vas3k-text)]">план дней</span>
            <button
              type="button"
              onClick={addMember}
              disabled={demo || saving}
              className="btn-vas3k px-4 py-2 text-sm"
            >
              Добавить
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottomColor: "var(--vas3k-input-border)" }} className="border-b">
                <th className="pb-2 pr-2 text-left text-[var(--vas3k-text)]">Фамилия</th>
                <th className="pb-2 pr-2 text-left text-[var(--vas3k-text)]">План</th>
                <th className="pb-2 text-right text-[var(--vas3k-text)]"></th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.map((m) => (
                <tr key={m.id} className="border-b" style={{ borderBottomColor: "var(--vas3k-input-border)" }}>
                  <td className="py-2 pr-2">
                    <input
                      type="text"
                      value={m.name}
                      onChange={(e) => setTeamMembers((prev) => prev.map((x) => (x.id === m.id ? { ...x, name: e.target.value } : x)))}
                      onBlur={(e) => e.target.value.trim() !== m.name && updateMember(m.id, "name", e.target.value.trim())}
                      disabled={demo}
                      className="w-full rounded border px-2 py-1 text-sm"
                      style={{
                        borderColor: "var(--vas3k-input-border)",
                        backgroundColor: "var(--vas3k-input-bg)",
                        color: "var(--vas3k-text)",
                      }}
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <input
                      type="number"
                      min={0}
                      max={7}
                      value={m.desired_days}
                      onChange={(e) => setTeamMembers((prev) => prev.map((x) => (x.id === m.id ? { ...x, desired_days: Number(e.target.value) || 0 } : x)))}
                      onBlur={(e) => updateMember(m.id, "desired_days", Number(e.target.value) || 0)}
                      disabled={demo}
                      className="w-16 rounded border px-2 py-1 text-sm"
                      style={{
                        borderColor: "var(--vas3k-input-border)",
                        backgroundColor: "var(--vas3k-input-bg)",
                        color: "var(--vas3k-text)",
                      }}
                    />
                  </td>
                  <td className="py-2 text-right">
                    {!demo && (
                      <button
                        type="button"
                        onClick={() => deleteMember(m.id)}
                        disabled={saving}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Удалить
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Столы */}
        <section
          className="mb-8 rounded-vas3k p-6 shadow-vas3k"
          style={{ backgroundColor: "var(--vas3k-block-bg)", border: "var(--vas3k-block-border)" }}
        >
          <h2 className="mb-4 text-lg font-semibold text-[var(--vas3k-text-bright)]">
            2. Столы
          </h2>
          <div className="mb-4 flex items-center gap-2">
            <label className="text-sm text-[var(--vas3k-text)]">Количество столов:</label>
            <input
              type="number"
              min={1}
              max={12}
              value={numDesks}
              onChange={(e) => setNumDesks(Math.max(1, Math.min(12, Number(e.target.value) || 1)))}
              disabled={demo}
              className="w-20 rounded border px-2 py-1 text-sm"
              style={{
                borderColor: "var(--vas3k-input-border)",
                backgroundColor: "var(--vas3k-input-bg)",
                color: "var(--vas3k-text)",
              }}
            />
            <button
              type="button"
              onClick={saveDesks}
              disabled={demo || saving}
              className="btn-vas3k ml-2 px-4 py-2 text-sm"
            >
              Сохранить столы
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {(desks.length ? desks : Array.from({ length: numDesks }, (_, i) => ({ id: i + 1, name: `Стол ${i + 1}` }))).map((d) => (
              <div key={d.id} className="flex items-center gap-2">
                <span className="w-8 text-sm text-[var(--vas3k-text)]">{d.id}.</span>
                <input
                  type="text"
                  value={d.name}
                  onChange={(e) =>
                    setDesks((prev) => {
                      const i = prev.findIndex((x) => x.id === d.id);
                      if (i < 0) return prev;
                      const next = [...prev];
                      next[i] = { ...next[i], name: e.target.value };
                      return next;
                    })
                  }
                  disabled={demo}
                  className="flex-1 rounded border px-2 py-1 text-sm"
                  style={{
                    borderColor: "var(--vas3k-input-border)",
                    backgroundColor: "var(--vas3k-input-bg)",
                    color: "var(--vas3k-text)",
                  }}
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
