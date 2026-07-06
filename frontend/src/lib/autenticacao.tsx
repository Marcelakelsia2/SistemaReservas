// Contexto de autenticação para todo o frontend.
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useNavigate } from "@/lib/router-compat";
import { armazenamento, autenticacaoApi } from "./api";
import type { Papel, Utilizador } from "./tipos";

interface ContextoAuth {
  utilizador: Utilizador | null;
  carregando: boolean;
  autenticado: boolean;
  entrar: (email: string, senha: string) => Promise<void>;
  sair: () => Promise<void>;
  atualizarUtilizador: (u: Utilizador) => void;
  temPapel: (...papeis: Papel[]) => boolean;
}

const Contexto = createContext<ContextoAuth | null>(null);

export function ProvedorAuth({ children }: { children: ReactNode }) {
  const [utilizador, setUtilizador] = useState<Utilizador | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    setUtilizador(armazenamento.obterUtilizador());
    setCarregando(false);
  }, []);

  const entrar = useCallback(async (email: string, senha: string) => {
    const resposta = await autenticacaoApi.login(email, senha);
    armazenamento.guardarSessao(resposta.token, resposta.refreshToken, resposta.usuario);
    setUtilizador(resposta.usuario);
  }, []);

  const sair = useCallback(async () => {
    try {
      await autenticacaoApi.logout();
    } catch {
      // ignora — terminamos sessão localmente de qualquer forma
    }
    armazenamento.limpar();
    setUtilizador(null);
    toast.success("Sessão terminada com sucesso");
  }, []);

  const atualizarUtilizador = useCallback((u: Utilizador) => {
    setUtilizador(u);
    const token = armazenamento.obterToken();
    const refresh = armazenamento.obterRefresh();
    if (token && refresh) armazenamento.guardarSessao(token, refresh, u);
  }, []);

  const temPapel = useCallback(
    (...papeis: Papel[]) => !!utilizador && papeis.includes(utilizador.role),
    [utilizador]
  );

  return (
    <Contexto.Provider
      value={{
        utilizador,
        carregando,
        autenticado: !!utilizador,
        entrar,
        sair,
        atualizarUtilizador,
        temPapel,
      }}
    >
      {children}
    </Contexto.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error("useAuth tem de ser usado dentro de ProvedorAuth");
  return ctx;
}

/** Hook para proteger páginas. Redireciona para /login se não autenticado. */
export function useGuardaAuth(papeisPermitidos?: Papel[]) {
  const { autenticado, carregando, utilizador } = useAuth();
  const navegar = useNavigate();

  useEffect(() => {
    if (carregando) return;
    if (!autenticado) {
      navegar({ to: "/login" });
      return;
    }
    if (papeisPermitidos && utilizador && !papeisPermitidos.includes(utilizador.role)) {
      navegar({ to: "/painel" });
    }
  }, [autenticado, carregando, utilizador, papeisPermitidos, navegar]);

  return { pronto: !carregando && autenticado };
}
