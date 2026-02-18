"use client";

export type TeamMemberRow = {
  name: string;
  desiredDays: number;
  bookedCount: number;
};

export type TeamSidebarProps = {
  members: TeamMemberRow[];
};

export function TeamSidebar({ members }: TeamSidebarProps) {
  return (
    <div
      className="rounded-vas3k p-6 shadow-vas3k"
      style={{
        backgroundColor: "var(--vas3k-block-bg)",
        border: "var(--vas3k-block-border)",
      }}
    >
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottomColor: "var(--vas3k-input-border)" }} className="border-b">
            <th className="pb-2 pr-3 text-left font-medium" style={{ color: "var(--vas3k-text)" }}>
              Имя
            </th>
            <th className="pb-2 pr-2 text-center font-medium" style={{ color: "var(--vas3k-text)" }}>
              План
            </th>
            <th
              className="whitespace-nowrap pb-2 text-center font-medium"
              style={{ color: "var(--vas3k-text)", minWidth: "5rem" }}
            >
              Факт
            </th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => {
            const isUnder = m.bookedCount < m.desiredDays;
            const isOver = m.bookedCount > m.desiredDays;
            const rowStyle: React.CSSProperties = {};
            if (isOver) rowStyle.backgroundColor = "rgba(255, 25, 23, 0.12)";
            else if (isUnder) rowStyle.backgroundColor = "rgba(255, 196, 85, 0.2)";
            return (
              <tr
                key={m.name}
                className="border-b"
                style={{ ...rowStyle, borderBottomColor: "var(--vas3k-input-border)" }}
              >
                <td className="py-2 pr-3 font-medium" style={{ color: "var(--vas3k-text-bright)" }}>
                  {m.name}
                </td>
                <td className="py-2 pr-2 text-center" style={{ color: "var(--vas3k-text)" }}>
                  {m.desiredDays}
                </td>
                <td className="py-2 text-center font-medium" style={{ color: "var(--vas3k-text-bright)" }}>
                  {m.bookedCount}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
