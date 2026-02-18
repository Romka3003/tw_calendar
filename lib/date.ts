/**
 * Вычисление локальной даты пользователя по смещению таймзоны (минуты).
 * getTimezoneOffset() возвращает разницу UTC - local в минутах.
 */
export function getLocalDateString(tzOffsetMinutes: number): string {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
  const localMs = utcMs - tzOffsetMinutes * 60 * 1000;
  const local = new Date(localMs);
  return local.toISOString().slice(0, 10);
}

/**
 * Массив из 7 дат: сегодня (в локальной дате пользователя) + 6 дней вперёд.
 */
export function getWeekDates(tzOffsetMinutes: number): string[] {
  const today = getLocalDateString(tzOffsetMinutes);
  const [y, m, d] = today.split("-").map(Number);
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(y, m - 1, d + i);
    dates.push(
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
    );
  }
  return dates;
}

/**
 * Рабочая неделя: понедельник–пятница (5 дат) для текущей недели в локальной дате пользователя.
 */
export function getWorkWeekDates(tzOffsetMinutes: number): string[] {
  const today = getLocalDateString(tzOffsetMinutes);
  const [y, m, d] = today.split("-").map(Number);
  const dObj = new Date(y, m - 1, d);
  const dayOfWeek = dObj.getDay(); // 0 вс, 1 пн, ..., 6 сб
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(y, m - 1, d + mondayOffset);
  const dates: string[] = [];
  for (let i = 0; i < 5; i++) {
    const date = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    dates.push(
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
    );
  }
  return dates;
}

/**
 * Проверка, что date входит в диапазон [start, end] (включительно).
 */
export function isDateInRange(date: string, start: string, end: string): boolean {
  return date >= start && date <= end;
}
