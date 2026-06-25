// Landing do callback OAuth do Google. O backend redirecciona aqui com ?token e ?refreshToken
// na querystring. Guardamos a sessão, vamos buscar o perfil e seguimos para o painel.
import { useNavigate } from "@/lib/router-compat";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { armazenamento, utilizadoresService, mensagemErro } from "@/services";
import { useAuth } from "@/lib/autenticacao";

export default function PaginaOAuthSucesso() {
  const navegar = useNavigate();
  const { atualizarUtilizador } = useAuth();
  const [erro, setErro] = useState<string | null>(null);
  const corrido = useRef(false);

  useEffect(() => {
    if (corrido.current) return;
    corrido.current = true;

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const refreshToken = params.get("refreshToken");
    const erroParam = params.get("erro");

    if (erroParam) {
      setErro(erroParam);
      toast.error(erroParam);
      return;
    }
    if (!token || !refreshToken) {
      setErro("Resposta OAuth inválida.");
      return;
    }

    armazenamento.guardarTokens(token, refreshToken);
    utilizadoresService
      .meuPerfil()
      .then((u) => {
        armazenamento.guardarUtilizador(u);
        atualizarUtilizador(u);
        toast.success(`Bem-vindo, ${u.nome.split(" ")[0]}!`);
        navegar({ to: "/painel" });
      })
      .catch((e) => {
        const m = mensagemErro(e);
        setErro(m);
        toast.error(m);
      });
  }, [navegar, atualizarUtilizador]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        {erro ? (
          <>
            <h1 className="text-xl font-semibold">Falha no login com Google</h1>
            <p className="text-sm text-muted-foreground mt-2">{erro}</p>
            <a
              href="/login"
              className="inline-block mt-4 text-primary hover:underline"
            >
              Voltar ao login
            </a>
          </>
        ) : (
          <p className="text-muted-foreground">A finalizar sessão...</p>
        )}
      </div>
    </div>
  );
}
