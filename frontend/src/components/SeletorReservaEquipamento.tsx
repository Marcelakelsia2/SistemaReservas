// Seletor de reserva específico para equipamentos.
// Reutiliza o SeletorReserva, mas calcula os intervalos livres a partir
// da resposta de disponibilidade de equipamento (que devolve reservas + quantidades).
import { SeletorReserva, type IntervaloLivre } from "./SeletorReserva";
import type { DisponibilidadeEquipamento } from "@/services";

function horaParaMin(h: string) {
  const [hh, mm] = h.split(":").map(Number);
  return hh * 60 + (mm || 0);
}
function minParaHora(m: number) {
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}
function extrairHora(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/**
 * Calcula intervalos livres considerando a quantidade pedida.
 * Para cada minuto da janela, soma a quantidade já reservada e marca como
 * disponível enquanto (total - reservado) >= quantidadePedida.
 */
export function calcularIntervalosEquipamento(
  resposta: DisponibilidadeEquipamento,
  quantidadePedida: number,
  janela: { inicio: string; fim: string } = { inicio: "06:00", fim: "23:00" },
): IntervaloLivre[] {
  const total = resposta.quantidadeTotal;
  const inicioJ = horaParaMin(janela.inicio);
  const fimJ = horaParaMin(janela.fim);

  // ocupação por minuto (apenas dentro da janela)
  const ocupacao = new Array(fimJ - inicioJ).fill(0) as number[];
  for (const r of resposta.reservas ?? []) {
    const ini = Math.max(inicioJ, horaParaMin(extrairHora(r.horaInicio as any)));
    const fim = Math.min(fimJ, horaParaMin(extrairHora(r.horaFim as any)));
    for (let m = ini; m < fim; m++) {
      const idx = m - inicioJ;
      if (idx >= 0 && idx < ocupacao.length) ocupacao[idx] += r.quantidade;
    }
  }

  const livres: IntervaloLivre[] = [];
  let inicioLivre: number | null = null;
  for (let i = 0; i < ocupacao.length; i++) {
    const disponivel = total - ocupacao[i] >= quantidadePedida;
    if (disponivel && inicioLivre === null) inicioLivre = i + inicioJ;
    if (!disponivel && inicioLivre !== null) {
      livres.push({ inicio: minParaHora(inicioLivre), fim: minParaHora(i + inicioJ) });
      inicioLivre = null;
    }
  }
  if (inicioLivre !== null) {
    livres.push({ inicio: minParaHora(inicioLivre), fim: minParaHora(fimJ) });
  }
  return livres;
}

interface Props {
  quantidadePedida: number;
  carregar: (data: string) => Promise<DisponibilidadeEquipamento>;
  valor: { data: string; horaInicio: string; horaFim: string };
  aoMudar: (v: { data: string; horaInicio: string; horaFim: string }) => void;
  janela?: { inicio: string; fim: string };
}

export function SeletorReservaEquipamento({
  quantidadePedida,
  carregar,
  valor,
  aoMudar,
  janela,
}: Props) {
  return (
    <SeletorReserva
      horarioFuncionamento={janela ?? { inicio: "06:00", fim: "23:00" }}
      carregarDisponibilidade={async (data) => {
        const resp = await carregar(data);
        return calcularIntervalosEquipamento(resp, quantidadePedida || 1, janela);
      }}
      valor={valor}
      aoMudar={aoMudar}
    />
  );
}
