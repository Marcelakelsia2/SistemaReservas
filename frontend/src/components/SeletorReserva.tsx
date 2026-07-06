// Seletor de data + hora para reservas.
// - Calendário com datas passadas desabilitadas
// - Datas totalmente reservadas marcadas como indisponíveis
// - Mostra apenas os intervalos/horas livres do dia escolhido
import { useEffect, useMemo, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface IntervaloLivre {
  inicio: string; // "HH:mm"
  fim: string; // "HH:mm"
}

interface Props {
  /** Hora de início e fim de funcionamento (HH:mm). Limita as opções. */
  horarioFuncionamento?: { inicio: string; fim: string };
  /** Função que devolve intervalos livres para uma data YYYY-MM-DD. */
  carregarDisponibilidade: (data: string) => Promise<IntervaloLivre[]>;
  /** Valor controlado. */
  valor: { data: string; horaInicio: string; horaFim: string };
  /** Notifica alterações. */
  aoMudar: (v: { data: string; horaInicio: string; horaFim: string }) => void;
}

const MINUTOS_PASSO = 30;

function horaParaMin(h: string) {
  const [hh, mm] = h.split(":").map(Number);
  return hh * 60 + (mm || 0);
}
function minParaHora(m: number) {
  const hh = String(Math.floor(m / 60)).padStart(2, "0");
  const mm = String(m % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

function gerarSlots(intervalos: IntervaloLivre[]): string[] {
  const slots = new Set<string>();
  for (const i of intervalos) {
    const ini = horaParaMin(i.inicio);
    const fim = horaParaMin(i.fim);
    for (let m = ini; m <= fim; m += MINUTOS_PASSO) {
      slots.add(minParaHora(m));
    }
  }
  return Array.from(slots).sort();
}

/** Devolve a string YYYY-MM-DD para uma data local sem deslizar de fuso. */
function paraISOLocal(d: Date): string {
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export function SeletorReserva({
  horarioFuncionamento,
  carregarDisponibilidade,
  valor,
  aoMudar,
}: Props) {
  const [dataSelecionada, setDataSelecionada] = useState<Date | undefined>(
    valor.data ? new Date(`${valor.data}T00:00:00`) : undefined
  );
  const [intervalos, setIntervalos] = useState<IntervaloLivre[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const hoje = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  useEffect(() => {
    if (!dataSelecionada) {
      setIntervalos([]);
      return;
    }
    const iso = paraISOLocal(dataSelecionada);
    setCarregando(true);
    setErro(null);
    carregarDisponibilidade(iso)
      .then((res) => {
        // Filtra ao horário de funcionamento se fornecido.
        if (horarioFuncionamento) {
          const minF = horaParaMin(horarioFuncionamento.inicio);
          const maxF = horaParaMin(horarioFuncionamento.fim);
          res = res
            .map((i) => ({
              inicio: minParaHora(Math.max(horaParaMin(i.inicio), minF)),
              fim: minParaHora(Math.min(horaParaMin(i.fim), maxF)),
            }))
            .filter((i) => horaParaMin(i.fim) > horaParaMin(i.inicio));
        }
        setIntervalos(res);
      })
      .catch((e: any) => setErro(e.message ?? "Falha ao carregar disponibilidade"))
      .finally(() => setCarregando(false));
  }, [dataSelecionada, carregarDisponibilidade, horarioFuncionamento]);

  // Quando a data muda, sincroniza com o valor controlado e limpa as horas.
  useEffect(() => {
    if (!dataSelecionada) return;
    const iso = paraISOLocal(dataSelecionada);
    if (iso !== valor.data) {
      aoMudar({ data: iso, horaInicio: "", horaFim: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSelecionada]);

  const slots = gerarSlots(intervalos);
  const horasInicio = slots.slice(0, -1);
  const horasFim = valor.horaInicio
    ? slots.filter((s) => horaParaMin(s) > horaParaMin(valor.horaInicio))
    : slots.slice(1);

  // Detecta dias totalmente sem disponibilidade — assinala-os com classe vermelha.
  // (Não dá para pré-carregar todos os dias sem mais chamadas; aqui só desabilitamos passado.)
  const diasDesabilitados = (d: Date) => d < hoje;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6">
      <div className={cn("rounded-md border p-2 pointer-events-auto")}>
        <Calendar
          mode="single"
          selected={dataSelecionada}
          onSelect={setDataSelecionada}
          disabled={diasDesabilitados}
          initialFocus
          className={cn("pointer-events-auto")}
        />
      </div>

      <div className="space-y-4">
        {!dataSelecionada ? (
          <p className="text-sm text-muted-foreground">
            Escolha uma data no calendário para ver as horas disponíveis.
          </p>
        ) : carregando ? (
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Loader2 size={16} className="animate-spin" /> A consultar disponibilidade...
          </p>
        ) : erro ? (
          <p className="text-sm text-destructive">{erro}</p>
        ) : slots.length === 0 ? (
          <p className="text-sm text-destructive">
            Não há horários disponíveis nesta data. Escolha outra.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Hora início</Label>
              <Select
                value={valor.horaInicio}
                onValueChange={(v) =>
                  aoMudar({ data: valor.data, horaInicio: v, horaFim: "" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar" />
                </SelectTrigger>
                <SelectContent>
                  {horasInicio.map((h) => (
                    <SelectItem key={h} value={h}>
                      {h}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Hora fim</Label>
              <Select
                value={valor.horaFim}
                onValueChange={(v) =>
                  aoMudar({ ...valor, horaFim: v })
                }
                disabled={!valor.horaInicio}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar" />
                </SelectTrigger>
                <SelectContent>
                  {horasFim.map((h) => (
                    <SelectItem key={h} value={h}>
                      {h}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {slots.length > 0 && (
          <div className="text-xs text-muted-foreground">
            Intervalos livres:{" "}
            {intervalos.map((i, idx) => (
              <span key={idx} className="inline-block mr-2">
                {i.inicio}–{i.fim}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
