"use client";

export interface NotificationMatrixRow {
  eventKey: string;
  label: string;
  appSound: boolean;
  push: boolean;
  sms: boolean;
  whatsapp: boolean;
  email: boolean;
}

interface MatrixTableProps {
  rows: NotificationMatrixRow[];
  onToggleChannel: (rowIndex: number, channel: "appSound" | "push") => void;
}

export function MatrixTable({ rows, onToggleChannel }: MatrixTableProps) {
  return (
    <div className="border border-border rounded-xl overflow-x-auto">
      <table className="w-full text-left text-xs min-w-[500px]">
        <thead className="bg-surface border-b border-border text-[11px] font-bold text-muted-foreground uppercase">
          <tr>
            <th className="p-3">Événement</th>
            <th className="p-3 text-center">Son dans l&apos;app</th>
            <th className="p-3 text-center">Push navigateur</th>
            <th className="p-3 text-center opacity-50">SMS</th>
            <th className="p-3 text-center opacity-50">WhatsApp</th>
            <th className="p-3 text-center opacity-50">E-mail</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row, index) => (
            <tr key={row.eventKey} className="hover:bg-surface/50">
              <td className="p-3 font-semibold text-heading">{row.label}</td>

              {/* App Sound */}
              <td className="p-3 text-center">
                <input
                  type="checkbox"
                  checked={row.appSound}
                  onChange={() => onToggleChannel(index, "appSound")}
                  className="size-4 rounded-sm border-border text-primary focus:ring-primary accent-primary cursor-pointer"
                  aria-label={`Son dans l'app pour ${row.label}`}
                />
              </td>

              {/* Push */}
              <td className="p-3 text-center">
                <input
                  type="checkbox"
                  checked={row.push}
                  onChange={() => onToggleChannel(index, "push")}
                  className="size-4 rounded-sm border-border text-primary focus:ring-primary accent-primary cursor-pointer"
                  aria-label={`Push navigateur pour ${row.label}`}
                />
              </td>

              {/* Proposed SMS */}
              <td className="p-3 text-center text-muted-foreground/50 text-[10px]">
                —
              </td>

              {/* Proposed WhatsApp */}
              <td className="p-3 text-center text-muted-foreground/50 text-[10px]">
                —
              </td>

              {/* Proposed Email */}
              <td className="p-3 text-center text-muted-foreground/50 text-[10px]">
                —
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
