"use client";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

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
    <div className="rounded-2xl bg-card overflow-x-auto shadow-xs">
      <Table className="text-xs min-w-[500px]">
        <TableHeader>
          <TableRow className="border-b border-border/60 hover:bg-transparent">
            <TableHead className="p-3 font-semibold text-muted-foreground">Événement</TableHead>
            <TableHead className="p-3 text-center font-semibold text-muted-foreground">Son dans l&apos;app</TableHead>
            <TableHead className="p-3 text-center font-semibold text-muted-foreground">Push navigateur</TableHead>
            <TableHead className="p-3 text-center font-semibold text-muted-foreground/50">SMS</TableHead>
            <TableHead className="p-3 text-center font-semibold text-muted-foreground/50">WhatsApp</TableHead>
            <TableHead className="p-3 text-center font-semibold text-muted-foreground/50">E-mail</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={row.eventKey} className="border-b border-border/60 last:border-b-0 hover:bg-muted/30">
              <TableCell className="p-3 font-semibold text-foreground">{row.label}</TableCell>

              {/* App Sound */}
              <TableCell className="p-3 text-center">
                <div className="flex justify-center">
                  <Checkbox
                    checked={row.appSound}
                    onCheckedChange={() => onToggleChannel(index, "appSound")}
                    aria-label={`Son dans l'app pour ${row.label}`}
                  />
                </div>
              </TableCell>

              {/* Push */}
              <TableCell className="p-3 text-center">
                <div className="flex justify-center">
                  <Checkbox
                    checked={row.push}
                    onCheckedChange={() => onToggleChannel(index, "push")}
                    aria-label={`Push navigateur pour ${row.label}`}
                  />
                </div>
              </TableCell>

              {/* Proposed SMS */}
              <TableCell className="p-3 text-center text-muted-foreground/50 text-[10px]">
                —
              </TableCell>

              {/* Proposed WhatsApp */}
              <TableCell className="p-3 text-center text-muted-foreground/50 text-[10px]">
                —
              </TableCell>

              {/* Proposed Email */}
              <TableCell className="p-3 text-center text-muted-foreground/50 text-[10px]">
                —
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
