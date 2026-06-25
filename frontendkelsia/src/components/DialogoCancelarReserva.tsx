// Diálogo de cancelamento de reserva.
// Quando um gestor (ADMIN/FUNCIONARIO) cancela a reserva de outro utilizador,
// o motivo passa a ser obrigatório.
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  reserva: { id: number } | null;
  exigeMotivo: boolean;
  carregando: boolean;
  aoFechar: () => void;
  aoConfirmar: (motivo?: string) => void;
}

export function DialogoCancelarReserva({
  reserva,
  exigeMotivo,
  carregando,
  aoFechar,
  aoConfirmar,
}: Props) {
  const [motivo, setMotivo] = useState("");
  useEffect(() => {
    if (!reserva) setMotivo("");
  }, [reserva]);

  const desactivado = carregando || (exigeMotivo && !motivo.trim());

  return (
    <Dialog open={!!reserva} onOpenChange={(o) => !o && aoFechar()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancelar reserva</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Tem a certeza que pretende cancelar esta reserva? Esta ação não pode ser
          revertida.
        </p>
        <div className="space-y-1">
          <Label>
            Motivo {exigeMotivo ? <span className="text-destructive">*</span> : "(opcional)"}
          </Label>
          <Textarea
            placeholder={
              exigeMotivo
                ? "Explique ao utilizador porque está a cancelar a reserva"
                : "Motivo (opcional)"
            }
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={aoFechar} disabled={carregando}>
            Voltar
          </Button>
          <Button
            variant="destructive"
            disabled={desactivado}
            onClick={() => aoConfirmar(motivo.trim() || undefined)}
          >
            {carregando ? "A cancelar..." : "Confirmar cancelamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
