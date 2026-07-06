import { http, desempacotar, baixarBlob } from "./http";
import type { Reserva } from "@/lib/tipos";

export interface DisponibilidadeSala {
  salaId: number;
  intervalosLivres: { inicio: string; fim: string }[];
}

export interface CriarReservaInput {
  salaId: number;
  data: string; // YYYY-MM-DD
  horaInicio: string; // HH:mm
  horaFim: string; // HH:mm
  observacao?: string;
}

export interface EditarReservaInput {
  salaId?: number;
  data?: string;
  horaInicio?: string;
  horaFim?: string;
  observacao?: string;
  motivoEdicao?: string;
}

export const reservasService = {
  listar: () => http.get<any>("/reservas").then(desempacotar<Reserva[]>),
  minhas: () => http.get<any>("/reservas/minhas").then(desempacotar<Reserva[]>),
  ver: (id: number) => http.get<any>(`/reservas/${id}`).then(desempacotar<Reserva>),
  criar: (dados: CriarReservaInput) =>
    http.post<any>("/reservas", dados).then(desempacotar<Reserva>),
  editar: (id: number, dados: EditarReservaInput) =>
    http.patch<any>(`/reservas/${id}`, dados).then(desempacotar<Reserva>),
  cancelar: (id: number, motivo?: string) =>
    http
      .patch<any>(`/reservas/${id}/cancelar`, { motivo })
      .then(desempacotar<Reserva>),
  disponibilidade: (salaId: number, data: string) =>
    http
      .get<any>(`/reservas/sala/${salaId}/disponibilidade/${data}`)
      .then(desempacotar<DisponibilidadeSala>),
  baixarComprovativo: async (id: number) => {
    const blob = await http.getBlob(`/reservas/${id}/comprovativo`);
    baixarBlob(blob, `comprovativo-reserva-sala-${id}.pdf`);
  },
};
