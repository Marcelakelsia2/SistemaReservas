import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Download, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Paginacao } from "@/components/Paginacao";
import { usePaginacao } from "@/hooks/usePaginacao";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/autenticacao";
import { reservasApi, salasApi, tiposSalaApi } from "@/lib/api";
import { SeletorReserva } from "@/components/SeletorReserva";
import type { Sala } from "@/lib/tipos";

const estados = ["DISPONIVEL", "INDISPONIVEL", "MANUTENCAO"] as const;

export default function PaginaSalas() {
  const { temPapel } = useAuth();
  const qc = useQueryClient();
  const ehAdmin = temPapel("ADMIN");

  const { data: salas, isLoading } = useQuery({ queryKey: ["salas"], queryFn: salasApi.listar });
  const { data: tipos } = useQuery({ queryKey: ["tipos-sala"], queryFn: tiposSalaApi.listar });

  const [editar, setEditar] = useState<Sala | null>(null);
  const [criarAberto, setCriarAberto] = useState(false);
  const [reservar, setReservar] = useState<Sala | null>(null);
  const [pesquisa, setPesquisa] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [removerAlvo, setRemoverAlvo] = useState<Sala | null>(null);

  const lista = useMemo(() => {
    const t = pesquisa.trim().toLowerCase();
    return (salas ?? []).filter((s) => {
      if (filtroTipo !== "todos" && String(s.tipoSalaId) !== filtroTipo) return false;
      if (!t) return true;
      return (
        s.nome.toLowerCase().includes(t) ||
        s.localizacao.toLowerCase().includes(t) ||
        (s.tipoSala?.nome ?? "").toLowerCase().includes(t)
      );
    });
  }, [salas, pesquisa, filtroTipo]);

  const { pagina, setPagina, totalPaginas, total, visiveis } = usePaginacao(lista, 9);

  const remover = useMutation({
    mutationFn: (id: number) => salasApi.remover(id),
    onSuccess: () => {
      toast.success("Sala removida");
      qc.invalidateQueries({ queryKey: ["salas"] });
      setRemoverAlvo(null);
    },
    onError: (e: any) => toast.error(e.message) });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Salas</h1>
          <p className="text-muted-foreground">Consulte e reserve salas disponíveis.</p>
        </div>
        {ehAdmin && (
          <Dialog open={criarAberto} onOpenChange={setCriarAberto}>
            <DialogTrigger asChild>
              <Button>
                <Plus size={16} className="mr-2" /> Nova sala
              </Button>
            </DialogTrigger>
            <FormularioSala
              tipos={tipos ?? []}
              aoTerminar={() => {
                setCriarAberto(false);
                qc.invalidateQueries({ queryKey: ["salas"] });
              }}
            />
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-3">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Pesquisar por nome, localização ou tipo..."
            className="pl-9"
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
          />
        </div>
        <Select value={filtroTipo} onValueChange={setFiltroTipo}>
          <SelectTrigger>
            <SelectValue placeholder="Tipo de sala" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            {(tipos ?? []).map((t) => (
              <SelectItem key={t.id} value={String(t.id)}>
                {t.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">A carregar...</p>
      ) : lista.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhuma sala encontrada.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {visiveis.map((sala) => (
              <Card key={sala.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{sala.nome}</CardTitle>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        sala.estado === "DISPONIVEL"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {sala.estado}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">Tipo:</span>{" "}
                    {sala.tipoSala?.nome ?? "—"}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Capacidade:</span> {sala.capacidade}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Localização:</span>{" "}
                    {sala.localizacao}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Horário:</span>{" "}
                    {sala.horaInicioFuncionamento} – {sala.horaFimFuncionamento}
                  </p>
                  {sala.descricao && (
                    <p className="text-muted-foreground italic">{sala.descricao}</p>
                  )}
                  <div className="flex flex-wrap gap-2 pt-3">
                    <Button
                      size="sm"
                      onClick={() => setReservar(sala)}
                      disabled={sala.estado !== "DISPONIVEL"}
                    >
                      Reservar
                    </Button>
                    {ehAdmin && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => setEditar(sala)}>
                          <Pencil size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setRemoverAlvo(sala)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </>
                    )}
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
        aberto={!!removerAlvo}
        titulo={`Remover sala "${removerAlvo?.nome ?? ""}"?`}
        descricao="Esta acção é permanente e remove a sala do sistema."
        textoConfirmar="Remover"
        variante="destrutiva"
        carregando={remover.isPending}
        aoCancelar={() => setRemoverAlvo(null)}
        aoConfirmar={() => removerAlvo && remover.mutate(removerAlvo.id)}
      />


      {editar && (
        <Dialog open onOpenChange={(o) => !o && setEditar(null)}>
          <FormularioSala
            sala={editar}
            tipos={tipos ?? []}
            aoTerminar={() => {
              setEditar(null);
              qc.invalidateQueries({ queryKey: ["salas"] });
            }}
          />
        </Dialog>
      )}

      {reservar && (
        <Dialog open onOpenChange={(o) => !o && setReservar(null)}>
          <DialogoReserva sala={reservar} aoTerminar={() => setReservar(null)} />
        </Dialog>
      )}
    </div>
  );
}

// ============ Formulário criar/editar sala ============
function FormularioSala({
  sala,
  tipos,
  aoTerminar }: {
  sala?: Sala;
  tipos: { id: number; nome: string }[];
  aoTerminar: () => void;
}) {
  const [form, setForm] = useState({
    nome: sala?.nome ?? "",
    capacidade: sala?.capacidade ?? 10,
    localizacao: sala?.localizacao ?? "",
    descricao: sala?.descricao ?? "",
    estado: sala?.estado ?? "DISPONIVEL",
    horaInicioFuncionamento: sala?.horaInicioFuncionamento ?? "08:00",
    horaFimFuncionamento: sala?.horaFimFuncionamento ?? "18:00",
    tipoSalaId: sala?.tipoSalaId ?? tipos[0]?.id ?? 0 });

  const mut = useMutation({
    mutationFn: () =>
      sala ? salasApi.editar(sala.id, form as any) : salasApi.criar(form as any),
    onSuccess: () => {
      toast.success(sala ? "Sala actualizada" : "Sala criada");
      aoTerminar();
    },
    onError: (e: any) => toast.error(e.message) });

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>{sala ? "Editar sala" : "Nova sala"}</DialogTitle>
      </DialogHeader>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1 sm:col-span-2">
          <Label>Nome</Label>
          <Input placeholder="Ex: Sala A1" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
        </div>
        <div className="space-y-1">
          <Label>Capacidade</Label>
          <Input
            type="number"
            placeholder="Nº de pessoas"
            value={form.capacidade}
            onChange={(e) => setForm({ ...form, capacidade: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-1">
          <Label>Tipo</Label>
          <Select
            value={String(form.tipoSalaId)}
            onValueChange={(v) => setForm({ ...form, tipoSalaId: Number(v) })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {tipos.map((t) => (
                <SelectItem key={t.id} value={String(t.id)}>
                  {t.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1 sm:col-span-2">
          <Label>Localização</Label>
          <Input
            placeholder="Ex: Edifício A, Piso 2"
            value={form.localizacao}
            onChange={(e) => setForm({ ...form, localizacao: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <Label>Hora início</Label>
          <Input
            type="time"
            value={form.horaInicioFuncionamento}
            onChange={(e) => setForm({ ...form, horaInicioFuncionamento: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <Label>Hora fim</Label>
          <Input
            type="time"
            value={form.horaFimFuncionamento}
            onChange={(e) => setForm({ ...form, horaFimFuncionamento: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <Label>Estado</Label>
          <Select
            value={form.estado}
            onValueChange={(v) => setForm({ ...form, estado: v as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {estados.map((e) => (
                <SelectItem key={e} value={e}>
                  {e}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1 sm:col-span-2">
          <Label>Descrição</Label>
          <Textarea
            value={form.descricao ?? ""}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={() => mut.mutate()} disabled={mut.isPending}>
          {mut.isPending ? "A guardar..." : "Guardar"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

// ============ Diálogo reservar sala ============
function DialogoReserva({ sala, aoTerminar }: { sala: Sala; aoTerminar: () => void }) {
  const qc = useQueryClient();
  const [valor, setValor] = useState({ data: "", horaInicio: "", horaFim: "" });
  const [obs, setObs] = useState("");
  const [criada, setCriada] = useState<{ id: number } | null>(null);
  const [aBaixar, setABaixar] = useState(false);

  const mut = useMutation({
    mutationFn: () =>
      reservasApi.criar({
        salaId: sala.id,
        data: valor.data,
        horaInicio: valor.horaInicio,
        horaFim: valor.horaFim,
        observacao: obs || undefined }),
    onSuccess: (r: any) => {
      toast.success("Reserva criada");
      qc.invalidateQueries({ queryKey: ["reservas"] });
      setCriada({ id: r?.id });
    },
    onError: (e: any) => toast.error(e.message) });

  async function baixar() {
    if (!criada?.id) return;
    setABaixar(true);
    try {
      await reservasApi.baixarComprovativo(criada.id);
    } catch (e: any) {
      toast.error(e.message || "Falha ao baixar comprovativo");
    } finally {
      setABaixar(false);
    }
  }

  if (criada) {
    return (
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reserva confirmada</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          A sua reserva da sala <strong>{sala.nome}</strong> foi criada com sucesso. Pode baixar o
          comprovativo agora ou mais tarde na página de Reservas.
        </p>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={aoTerminar}>Fechar</Button>
          <Button onClick={baixar} disabled={aBaixar}>
            <Download size={16} className="mr-2" />
            {aBaixar ? "A baixar..." : "Baixar comprovativo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    );
  }

  return (
    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Reservar — {sala.nome}</DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        <SeletorReserva
          horarioFuncionamento={{
            inicio: sala.horaInicioFuncionamento,
            fim: sala.horaFimFuncionamento }}
          carregarDisponibilidade={async (data) => {
            const d = await reservasApi.disponibilidade(sala.id, data);
            return d?.intervalosLivres ?? [];
          }}
          valor={valor}
          aoMudar={setValor}
        />
        <div className="space-y-1">
          <Label>Observação (opcional)</Label>
          <Textarea value={obs} onChange={(e) => setObs(e.target.value)} />
        </div>
      </div>
      <DialogFooter>
        <Button
          onClick={() => mut.mutate()}
          disabled={!valor.data || !valor.horaInicio || !valor.horaFim || mut.isPending}
        >
          {mut.isPending ? "A reservar..." : "Confirmar reserva"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
