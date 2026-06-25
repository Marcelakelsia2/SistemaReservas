// Serviço de utilizadores — perfil próprio e gestão (admin).
import { http, desempacotar, queryString } from "./http";
import type { Utilizador, Papel } from "@/lib/tipos";

export interface MetaPaginacao {
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

export interface RespostaPaginada<T> {
  dados: T[];
  meta: MetaPaginacao;
}

export interface AtualizarPerfilDados {
  nome?: string;
  email?: string;
  telefone?: string;
}

export const utilizadoresService = {
  meuPerfil: () =>
    http.get<any>("/utilizadores/me").then(desempacotar<Utilizador>),

  atualizarPerfil: (dados: AtualizarPerfilDados) =>
    http.patch<any>("/utilizadores/me", dados).then((r) => {
      // backend devolve { mensagem, ...utilizador }
      const { mensagem: _m, ...rest } = r ?? {};
      return (rest.dados ?? rest) as Utilizador;
    }),

  alterarPalavraPasse: (senhaAtual: string, novaSenha: string) =>
    http.patch<{ mensagem: string }>(
      "/utilizadores/me/palavra-passe",
      { senhaAtual, novaSenha }
    ),

  listar: (opts: { pagina?: number; limite?: number } = {}) =>
    http.get<RespostaPaginada<Utilizador>>(
      `/utilizadores${queryString({ pagina: opts.pagina, limite: opts.limite })}`
    ),

  ver: (id: number) =>
    http.get<any>(`/utilizadores/${id}`).then(desempacotar<Utilizador>),

  alterarTipo: (id: number, role: Papel) =>
    http
      .patch<any>(`/utilizadores/${id}/tipo`, { role })
      .then((r) => (r?.utilizador ?? r?.dados ?? r) as Utilizador),

  alterarEstado: (id: number, ativo: boolean) =>
    http
      .patch<any>(`/utilizadores/${id}/estado`, { ativo })
      .then((r) => (r?.utilizador ?? r?.dados ?? r) as Utilizador),

  remover: (id: number) => http.delete<{ mensagem: string }>(`/utilizadores/${id}`),
};
