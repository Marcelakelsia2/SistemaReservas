// Serviço de autenticação — login email/senha, registo, recuperação, refresh, OAuth Google.
import { http, URL_BASE } from "./http";
import type { RespostaLogin, Utilizador } from "@/lib/tipos";

export const authService = {
  registar: (dados: { nome: string; email: string; telefone: string; senha: string }) =>
    http.post<{ mensagem: string; usuario: Utilizador }>(
      "/autenticacao/registar",
      dados,
      false
    ),

  verificarEmail: (email: string, codigo: string) =>
    http.post<{ mensagem: string }>(
      "/autenticacao/verificar-email",
      { email, codigo },
      false
    ),

  reenviarCodigo: (email: string) =>
    http.post<{ mensagem: string }>("/autenticacao/reenviar-codigo", { email }, false),

  login: (email: string, senha: string) =>
    http.post<RespostaLogin>("/autenticacao/iniciar-sessao", { email, senha }, false),

  recuperarSenha: (email: string) =>
    http.post<{ mensagem: string }>(
      "/autenticacao/esqueci-palavra-passe",
      { email },
      false
    ),

  redefinirSenha: (email: string, codigo: string, novaSenha: string) =>
    http.post<{ mensagem: string }>(
      "/autenticacao/redefinir-palavra-passe",
      { email, codigo, novaSenha },
      false
    ),

  logout: () => http.post<{ mensagem: string }>("/autenticacao/logout"),

  /** URL para iniciar o fluxo OAuth do Google (redirecciona o browser). */
  urlGoogle: () => `${URL_BASE.replace(/\/api\/?$/, "")}/api/auth/google`,
};
