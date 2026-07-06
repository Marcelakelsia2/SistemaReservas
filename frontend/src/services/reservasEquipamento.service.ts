import { http, desempacotar, queryString, baixarBlob } from "./http";
import type { ReservaEquipamento } from "@/lib/tipos";

export interface DisponibilidadeEquipamento {
  equipamentoId: number;
  quantidadeTotal: number;
  data: string;
  reservas: Array<{
    horaInicio: string;
    horaFim: string;
    quantidade: number;
  }>;
}

export interface CriarReservaEqInput {
  equipamentoId: number;
  quantidade: number;
  data: string;
  horaInicio: string;
  horaFim: string;
  observacao?: string;
}

export interface EditarReservaEqInput {
  equipamentoId?: number;
  quantidade?: number;
  data?: string;
  horaInicio?: string;
  horaFim?: string;
  observacao?: string;
  motivoEdicao?: string;
}

export const reservasEquipamentoService = {
  listar: () =>
    http.get<any>("/reservas-equipamentos").then(desempacotar<ReservaEquipamento[]>),
  minhas: () =>
    http
      .get<any>("/reservas-equipamentos/minhas")
      .then(desempacotar<ReservaEquipamento[]>),
  ver: (id: number) =>
    http
      .get<any>(`/reservas-equipamentos/${id}`)
      .then(desempacotar<ReservaEquipamento>),
  disponibilidade: (equipamentoId: number, data: string) =>
    http
      .get<any>(
        `/reservas-equipamentos/equipamento/${equipamentoId}/disponibilidade${queryString(
          { data }
        )}`
      )
      .then(desempacotar<DisponibilidadeEquipamento>),
  criar: (dados: CriarReservaEqInput) =>
    http
      .post<any>("/reservas-equipamentos", dados)
      .then(desempacotar<ReservaEquipamento>),
  editar: (id: number, dados: EditarReservaEqInput) =>
    http
      .patch<any>(`/reservas-equipamentos/${id}`, dados)
      .then(desempacotar<ReservaEquipamento>),
  cancelar: (id: number, motivo?: string) =>
    http
      .patch<any>(`/reservas-equipamentos/${id}/cancelar`, { motivo })
      .then(desempacotar<ReservaEquipamento>),
  baixarComprovativo: async (id: number) => {
    // Endpoint conforme spec: /api/reservas-equipamentos/{id}/comprovativo
    const blob = await http.getBlob(`/reservas-equipamentos/${id}/comprovativo`);
    baixarBlob(blob, `comprovativo-reserva-equipamento-${id}.pdf`);
  },
};
