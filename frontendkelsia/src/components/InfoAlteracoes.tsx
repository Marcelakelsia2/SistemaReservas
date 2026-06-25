// Mostra ao utilizador quem alterou ou cancelou a sua reserva, quando e porquê.
import { AlertCircle, Pencil } from "lucide-react";
import type { Reserva, ReservaEquipamento } from "@/lib/tipos";

function fmt(d?: string) {
  if (!d) return "";
  const dt = new Date(d);
  return `${dt.toLocaleDateString("pt-PT")} ${dt.toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export function InfoAlteracoes({
  reserva,
}: {
  reserva: Reserva | ReservaEquipamento;
}) {
  const quem = reserva.alteradoPor?.nome;
  const quando = fmt(reserva.updatedAt);
  if (reserva.status === "CANCELADA" && reserva.motivoCancelamento) {
    return (
      <div className="mt-2 text-xs rounded-md border border-destructive/30 bg-destructive/5 px-2 py-1.5 text-destructive flex gap-2">
        <AlertCircle size={14} className="mt-0.5 shrink-0" />
        <div>
          <p className="font-medium">Cancelada{quem ? ` por ${quem}` : ""}{quando ? ` · ${quando}` : ""}</p>
          <p className="opacity-90">Motivo: {reserva.motivoCancelamento}</p>
        </div>
      </div>
    );
  }
  if (reserva.motivoEdicao) {
    return (
      <div className="mt-2 text-xs rounded-md border border-amber-300 bg-amber-50 px-2 py-1.5 text-amber-800 flex gap-2 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800/50">
        <Pencil size={14} className="mt-0.5 shrink-0" />
        <div>
          <p className="font-medium">Editada{quem ? ` por ${quem}` : ""}{quando ? ` · ${quando}` : ""}</p>
          <p className="opacity-90">Motivo: {reserva.motivoEdicao}</p>
        </div>
      </div>
    );
  }
  return null;
}
