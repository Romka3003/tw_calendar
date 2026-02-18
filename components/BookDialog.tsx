"use client";

import { useState } from "react";

export type BookDialogProps = {
  open: boolean;
  deskName: string;
  dateLabel: string;
  onConfirm: (note: string) => void;
  onCancel: () => void;
};

export function BookDialog({
  open,
  deskName,
  dateLabel,
  onConfirm,
  onCancel,
}: BookDialogProps) {
  const [note, setNote] = useState("");

  if (!open) return null;

  const handleConfirm = () => {
    onConfirm(note.trim() || "");
    setNote("");
  };

  const handleCancel = () => {
    setNote("");
    onCancel();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="book-dialog-title"
    >
      <div
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="book-dialog-title" className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Бронирование
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {deskName}, {dateLabel}
        </p>
        <label className="mt-4 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Заметка (необязательно)
        </label>
        <input
          type="text"
          maxLength={140}
          placeholder="До 140 символов"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
        />
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
          >
            Подтвердить
          </button>
        </div>
      </div>
    </div>
  );
}
