import { http, desempacotar } from "./http";
import type { TipoSala } from "@/lib/tipos";

export const tiposSalaService = {
  listar: () => http.get<any>("/tipos-sala").then(desempacotar<TipoSala[]>),
  ver: (id: number) => http.get<any>(`/tipos-sala/${id}`).then(desempacotar<TipoSala>),
  criar: (nome: string, descricao?: string) =>
    http.post<any>("/tipos-sala", { nome, descricao }).then(desempacotar<TipoSala>),
  editar: (id: number, dados: Partial<TipoSala>) =>
    http.patch<any>(`/tipos-sala/${id}`, dados).then(desempacotar<TipoSala>),
  remover: (id: number) => http.delete<{ mensagem: string }>(`/tipos-sala/${id}`),
};
