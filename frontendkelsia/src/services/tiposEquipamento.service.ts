import { http, desempacotar } from "./http";
import type { TipoEquipamento } from "@/lib/tipos";

export const tiposEquipamentoService = {
  listar: () =>
    http.get<any>("/tipos-equipamento").then(desempacotar<TipoEquipamento[]>),
  ver: (id: number) =>
    http.get<any>(`/tipos-equipamento/${id}`).then(desempacotar<TipoEquipamento>),
  criar: (nome: string, descricao?: string) =>
    http
      .post<any>("/tipos-equipamento", { nome, descricao })
      .then(desempacotar<TipoEquipamento>),
  editar: (id: number, dados: Partial<TipoEquipamento>) =>
    http
      .patch<any>(`/tipos-equipamento/${id}`, dados)
      .then(desempacotar<TipoEquipamento>),
  remover: (id: number) =>
    http.delete<{ mensagem: string }>(`/tipos-equipamento/${id}`),
};
