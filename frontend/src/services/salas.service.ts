import { http, desempacotar } from "./http";
import type { Sala } from "@/lib/tipos";

export const salasService = {
  listar: () => http.get<any>("/salas").then(desempacotar<Sala[]>),
  disponiveis: () => http.get<any>("/salas/disponiveis").then(desempacotar<Sala[]>),
  ver: (id: number) => http.get<any>(`/salas/${id}`).then(desempacotar<Sala>),
  criar: (dados: Omit<Sala, "id" | "tipoSala">) =>
    http.post<any>("/salas", dados).then(desempacotar<Sala>),
  editar: (id: number, dados: Partial<Sala>) =>
    http.put<any>(`/salas/${id}`, dados).then(desempacotar<Sala>),
  alterarEstado: (id: number, estado: string) =>
    http
      .patch<any>(`/salas/${id}/disponibilidade`, { estado })
      .then(desempacotar<Sala>),
  remover: (id: number) => http.delete<{ mensagem: string }>(`/salas/${id}`),
};
