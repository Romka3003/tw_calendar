export interface TeamMember {
  name: string;
  desiredDays: number;
}

/** Список команды и желаемое количество дней в офисе на неделю */
export const TEAM_MEMBERS: TeamMember[] = [
  { name: "Бикташов", desiredDays: 2 },
  { name: "Перфильева", desiredDays: 3 },
  { name: "Ковзель", desiredDays: 2 },
  { name: "Крутицкая", desiredDays: 3 },
  { name: "Раззаков", desiredDays: 2 },
  { name: "Антипина", desiredDays: 2 },
  { name: "Воронцова", desiredDays: 3 },
  { name: "Гребенюк", desiredDays: 2 },
  { name: "Баскир", desiredDays: 5 },
  { name: "Власов", desiredDays: 2 },
  { name: "Власова", desiredDays: 1 },
  { name: "Малинова", desiredDays: 3 },
  { name: "Самодова", desiredDays: 2 },
  { name: "Борщева", desiredDays: 2 },
  { name: "Илюхин", desiredDays: 2 },
];

export function getBookedCountForMember(
  memberName: string,
  bookings: { booked_by: string }[]
): number {
  return bookings.filter((b) => b.booked_by === memberName).length;
}
