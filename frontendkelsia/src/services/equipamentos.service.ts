import { http, desempacotar } from "./http";
import type { Equipamento } from "@/lib/tipos";

export const equipamentosService = {
  listar: () => http.get<any>("/equipamentos").then(desempacotar<Equipamento[]>),
  disponiveis: () =>
    http.get<any>("/equipamentos/disponiveis").then(desempacotar<Equipamento[]>),
  ver: (id: number) =>
    http.get<any>(`/equipamentos/${id}`).then(desempacotar<Equipamento>),
  criar: (dados: Omit<Equipamento, "id" | "tipoEquipamento">) =>
    http.post<any>("/equipamentos", dados).then(desempacotar<Equipamento>),
  editar: (id: number, dados: Partial<Equipamento>) =>
    http.patch<any>(`/equipamentos/${id}`, dados).then(desempacotar<Equipamento>),
  alterarEstado: (id: number, estado: string) =>
    http
      .patch<any>(`/equipamentos/${id}/disponibilidade`, { estado })
      .then(desempacotar<Equipamento>),
  alterarQuantidade: (id: number, quantidadeTotal: number) =>
    http
      .patch<any>(`/equipamentos/${id}/quantidade`, { quantidadeTotal })
      .then(desempacotar<Equipamento>),
  remover: (id: number) => http.delete<{ mensagem: string }>(`/equipamentos/${id}`),
};
