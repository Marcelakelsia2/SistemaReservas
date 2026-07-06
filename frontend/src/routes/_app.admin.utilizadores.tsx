import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Paginacao } from "@/components/Paginacao";
import { usePaginacao } from "@/hooks/usePaginacao";
import { useGuardaAuth } from "@/lib/autenticacao";
import { utilizadoresApi } from "@/lib/api";
import type { Papel, Utilizador } from "@/lib/tipos";

const papeis: Papel[] = ["ADMIN", "FUNCIONARIO", "USUARIO"];
type FiltroEstado = "todos" | "ativos" | "inativos";

type AccaoPendente =
  | { tipo: "estado"; alvo: Utilizador }
  | { tipo: "remover"; alvo: Utilizador }
  | null;

export default function PaginaUtilizadores() {
  useGuardaAuth(["ADMIN"]);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["utilizadores"], queryFn: utilizadoresApi.listar });

  const [pesquisa, setPesquisa] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("todos");
  const [filtroPapel, setFiltroPapel] = useState<"todos" | Papel>("todos");
  const [accao, setAccao] = useState<AccaoPendente>(null);

  const lista = useMemo(() => {
    const t = pesquisa.trim().toLowerCase();
    return (q.data ?? []).filter((u) => {
      if (filtroEstado === "ativos" && !u.ativo) return false;
      if (filtroEstado === "inativos" && u.ativo) return false;
      if (filtroPapel !== "todos" && u.role !== filtroPapel) return false;
      if (!t) return true;
      return (
        u.nome.toLowerCase().includes(t) ||
        u.email.toLowerCase().includes(t) ||
        (u.telefone ?? "").toLowerCase().includes(t)
      );
    });
  }, [q.data, pesquisa, filtroEstado, filtroPapel]);

  const { pagina, setPagina, totalPaginas, total, visiveis } = usePaginacao(lista, 10);

  const alterarTipo = useMutation({
    mutationFn: ({ id, role }: { id: number; role: Papel }) =>
      utilizadoresApi.alterarTipo(id, role),
    onSuccess: () => {
      toast.success("Papel actualizado");
      qc.invalidateQueries({ queryKey: ["utilizadores"] });
    },
    onError: (e: any) => toast.error(e.message) });

  const alterarEstado = useMutation({
    mutationFn: ({ id, ativo }: { id: number; ativo: boolean }) =>
      utilizadoresApi.alterarEstado(id, ativo),
    onSuccess: () => {
      toast.success("Estado actualizado");
      qc.invalidateQueries({ queryKey: ["utilizadores"] });
      setAccao(null);
    },
    onError: (e: any) => toast.error(e.message) });

  const remover = useMutation({
    mutationFn: (id: number) => utilizadoresApi.remover(id),
    onSuccess: () => {
      toast.success("Utilizador removido");
      qc.invalidateQueries({ queryKey: ["utilizadores"] });
      setAccao(null);
    },
    onError: (e: any) => toast.error(e.message) });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Utilizadores</h1>
        <p className="text-muted-foreground">Gestão de contas e papéis.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_180px] gap-3">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Pesquisar por nome, email ou telefone..."
            className="pl-9"
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
          />
        </div>
        <Select value={filtroEstado} onValueChange={(v) => setFiltroEstado(v as FiltroEstado)}>
          <SelectTrigger>
            <SelectValue placeholder="Estado da conta" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os estados</SelectItem>
            <SelectItem value="ativos">Contas activas</SelectItem>
            <SelectItem value="inativos">Contas inactivas</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filtroPapel}
          onValueChange={(v) => setFiltroPapel(v as typeof filtroPapel)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Papel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os papéis</SelectItem>
            {papeis.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {q.isLoading ? (
        <p className="text-muted-foreground">A carregar...</p>
      ) : lista.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Nenhum utilizador encontrado.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {visiveis.map((u) => (
              <Card key={u.id}>
                <CardContent className="py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium truncate">{u.nome}</p>
                      <Badge variant={u.ativo ? "default" : "secondary"}>
                        {u.ativo ? "Activo" : "Inactivo"}
                      </Badge>
                      {u.emailVerificado ? (
                        <Badge variant="outline">Email verificado</Badge>
                      ) : (
                        <Badge variant="outline" className="border-amber-500 text-amber-700">
                          Por verificar
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                    <p className="text-xs text-muted-foreground">{u.telefone}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Select
                      value={u.role}
                      onValueChange={(v) =>
                        alterarTipo.mutate({ id: u.id, role: v as Papel })
                      }
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {papeis.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      variant={u.ativo ? "outline" : "default"}
                      onClick={() => setAccao({ tipo: "estado", alvo: u })}
                    >
                      {u.ativo ? "Desactivar" : "Activar"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setAccao({ tipo: "remover", alvo: u })}
                    >
                      Remover
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Paginacao
            pagina={pagina}
            totalPaginas={totalPaginas}
            total={total}
            aoMudar={setPagina}
          />
        </>
      )}

      <ConfirmDialog
        aberto={accao?.tipo === "estado"}
        titulo={
          accao?.tipo === "estado" && accao.alvo.ativo
            ? `Desactivar ${accao.alvo.nome}?`
            : `Activar ${accao?.tipo === "estado" ? accao.alvo.nome : ""}?`
        }
        descricao={
          accao?.tipo === "estado" && accao.alvo.ativo
            ? "O utilizador deixará de conseguir aceder à aplicação."
            : "O utilizador voltará a conseguir aceder à aplicação."
        }
        textoConfirmar={accao?.tipo === "estado" && accao.alvo.ativo ? "Desactivar" : "Activar"}
        variante={accao?.tipo === "estado" && accao.alvo.ativo ? "destrutiva" : "padrao"}
        carregando={alterarEstado.isPending}
        aoCancelar={() => setAccao(null)}
        aoConfirmar={() => {
          if (accao?.tipo !== "estado") return;
          alterarEstado.mutate({ id: accao.alvo.id, ativo: !accao.alvo.ativo });
        }}
      />

      <ConfirmDialog
        aberto={accao?.tipo === "remover"}
        titulo={`Remover ${accao?.tipo === "remover" ? accao.alvo.nome : ""}?`}
        descricao="Esta acção é permanente e não pode ser revertida."
        textoConfirmar="Remover"
        variante="destrutiva"
        carregando={remover.isPending}
        aoCancelar={() => setAccao(null)}
        aoConfirmar={() => {
          if (accao?.tipo !== "remover") return;
          remover.mutate(accao.alvo.id);
        }}
      />
    </div>
  );
}
