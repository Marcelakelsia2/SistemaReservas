import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Download, Pencil, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Paginacao } from "@/components/Paginacao";
import { usePaginacao } from "@/hooks/usePaginacao";
import { DialogoCancelarReserva } from "@/components/DialogoCancelarReserva";
import { InfoAlteracoes } from "@/components/InfoAlteracoes";
import { SeletorReserva } from "@/components/SeletorReserva";
import { SeletorReservaEquipamento } from "@/components/SeletorReservaEquipamento";
import { reservasApi, reservasEquipamentoApi } from "@/lib/api";
import { useAuth } from "@/lib/autenticacao";
import type {
  Reserva,
  ReservaEquipamento,
  StatusReserva,
  Utilizador } from "@/lib/tipos";

const STATUS: ("todos" | StatusReserva)[] = [
  "todos",
  "CONFIRMADA",
  "CANCELADA",
  "CONCLUIDA",
];

function formatarData(d: string) {
  return new Date(d).toLocaleDateString("pt-PT");
}
function formatarHora(d: string) {
  return new Date(d).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
}
function paraInputData(iso: string) {
  return new Date(iso).toISOString().slice(0, 10);
}
function paraInputHora(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function podeEditarReserva(
  r: { usuarioId: number; status: StatusReserva },
  utilizador: Utilizador | null,
  ehGestor: boolean,
) {
  if (r.status !== "CONFIRMADA") return false;
  if (ehGestor) return true;
  return !!utilizador && r.usuarioId === utilizador.id;
}

function BotaoComprovativo({
  id,
  tipo,
}: {
  id: number;
  tipo: "sala" | "equipamento";
}) {
  const [a, setA] = useState(false);
  async function baixar() {
    setA(true);
    try {
      if (tipo === "sala") await reservasApi.baixarComprovativo(id);
      else await reservasEquipamentoApi.baixarComprovativo(id);
    } catch (e: any) {
      toast.error(e.message || "Falha ao baixar comprovativo");
    } finally {
      setA(false);
    }
  }
  return (
    <Button size="sm" variant="outline" onClick={baixar} disabled={a}>
      <Download size={14} className="mr-1" />
      {a ? "A baixar..." : "Comprovativo"}
    </Button>
  );
}

export default function PaginaReservas() {
  const { temPapel } = useAuth();
  const podeVerTodas = temPapel("ADMIN", "FUNCIONARIO");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Reservas</h1>
        <p className="text-muted-foreground">Acompanhe e gira as suas reservas.</p>
      </div>

      <Tabs defaultValue="salas-min">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="salas-min">Minhas Reservas de Salas</TabsTrigger>
          <TabsTrigger value="eq-min">Meus Reservas de Equipamentos</TabsTrigger>
          {podeVerTodas && <TabsTrigger value="salas-tod">Todas as Reservas de Salas</TabsTrigger>}
          {podeVerTodas && <TabsTrigger value="eq-tod">Todas as Reservas de equipamentos</TabsTrigger>}
        </TabsList>
        <TabsContent value="salas-min">
          <ListaReservasSala fonte="minhas" />
        </TabsContent>
        <TabsContent value="eq-min">
          <ListaReservasEq fonte="minhas" />
        </TabsContent>
        {podeVerTodas && (
          <TabsContent value="salas-tod">
            <ListaReservasSala fonte="todas" />
          </TabsContent>
        )}
        {podeVerTodas && (
          <TabsContent value="eq-tod">
            <ListaReservasEq fonte="todas" />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

function FiltrosLista({
  pesquisa,
  setPesquisa,
  status,
  setStatus,
  placeholder }: {
  pesquisa: string;
  setPesquisa: (v: string) => void;
  status: "todos" | StatusReserva;
  setStatus: (v: "todos" | StatusReserva) => void;
  placeholder: string;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-3 mt-4">
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder={placeholder}
          className="pl-9"
          value={pesquisa}
          onChange={(e) => setPesquisa(e.target.value)}
        />
      </div>
      <Select value={status} onValueChange={(v) => setStatus(v as any)}>
        <SelectTrigger>
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          {STATUS.map((s) => (
            <SelectItem key={s} value={s}>
              {s === "todos" ? "Todos os estados" : s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function ListaReservasSala({ fonte }: { fonte: "minhas" | "todas" }) {
  const qc = useQueryClient();
  const { utilizador, temPapel } = useAuth();
  const ehGestor = temPapel("ADMIN", "FUNCIONARIO");
  const q = useQuery({
    queryKey: ["reservas", fonte],
    queryFn: () => (fonte === "minhas" ? reservasApi.minhas() : reservasApi.listar()) });
  const [pesquisa, setPesquisa] = useState("");
  const [status, setStatus] = useState<"todos" | StatusReserva>("todos");
  const [cancelarAlvo, setCancelarAlvo] = useState<Reserva | null>(null);
  const [editarAlvo, setEditarAlvo] = useState<Reserva | null>(null);

  const cancelar = useMutation({
    mutationFn: ({ id, motivo }: { id: number; motivo?: string }) =>
      reservasApi.cancelar(id, motivo),
    onSuccess: () => {
      toast.success("Reserva cancelada");
      qc.invalidateQueries({ queryKey: ["reservas"] });
      setCancelarAlvo(null);
    },
    onError: (e: any) => toast.error(e.message) });

  const lista = useMemo(() => {
    const t = pesquisa.trim().toLowerCase();
    return (q.data ?? []).filter((r) => {
      if (status !== "todos" && r.status !== status) return false;
      if (!t) return true;
      return (
        (r.sala?.nome ?? "").toLowerCase().includes(t) ||
        (r.sala?.tipoSala?.nome ?? "").toLowerCase().includes(t) ||
        (r.usuario?.nome ?? "").toLowerCase().includes(t) ||
        (r.observacao ?? "").toLowerCase().includes(t)
      );
    });
  }, [q.data, pesquisa, status]);

  const { pagina, setPagina, totalPaginas, total, visiveis } = usePaginacao(lista, 10);

  return (
    <>
      <FiltrosLista
        pesquisa={pesquisa}
        setPesquisa={setPesquisa}
        status={status}
        setStatus={setStatus}
        placeholder="Pesquisar por sala, tipo, utilizador ou observação..."
      />
      {q.isLoading ? (
        <p className="text-muted-foreground mt-4">A carregar...</p>
      ) : lista.length === 0 ? (
        <Card className="mt-4">
          <CardContent className="py-10 text-center text-muted-foreground">
            Sem reservas.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 mt-4">
          {visiveis.map((r) => (
            <Card key={r.id}>
              <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{r.sala?.nome ?? `Sala #${r.salaId}`}</p>
                  {r.sala?.tipoSala?.nome && (
                    <p className="text-xs text-muted-foreground">{r.sala.tipoSala.nome}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {formatarData(r.data)} · {formatarHora(r.horaInicio)} –{" "}
                    {formatarHora(r.horaFim)}
                  </p>
                  {r.usuario && fonte === "todas" && (
                    <p className="text-xs text-muted-foreground">por {r.usuario.nome}</p>
                  )}
                  {r.observacao && (
                    <p className="text-xs text-muted-foreground italic mt-1">{r.observacao}</p>
                  )}
                  <InfoAlteracoes reserva={r} />
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      r.status === "CONFIRMADA"
                        ? "bg-emerald-100 text-emerald-700"
                        : r.status === "CANCELADA"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {r.status}
                  </span>
                  {podeEditarReserva(r, utilizador, ehGestor) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditarAlvo(r)}
                    >
                      <Pencil size={14} className="mr-1" /> Editar
                    </Button>
                  )}
                  {r.status === "CONFIRMADA" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCancelarAlvo(r)}
                    >
                      Cancelar
                    </Button>
                  )}
                  {(r.status === "CONFIRMADA" || r.status === "CONCLUIDA") && (
                    <BotaoComprovativo id={r.id} tipo="sala" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          <Paginacao
            pagina={pagina}
            totalPaginas={totalPaginas}
            total={total}
            aoMudar={setPagina}
          />
        </div>
      )}

      <DialogoCancelarReserva
        reserva={cancelarAlvo}
        exigeMotivo={!!cancelarAlvo && ehGestor && cancelarAlvo.usuarioId !== utilizador?.id}
        carregando={cancelar.isPending}
        aoFechar={() => setCancelarAlvo(null)}
        aoConfirmar={(motivo?: string) => cancelarAlvo && cancelar.mutate({ id: cancelarAlvo.id, motivo })}
      />

      {editarAlvo && (
        <DialogoEditarReservaSala
          reserva={editarAlvo}
          exigeMotivo={ehGestor && editarAlvo.usuarioId !== utilizador?.id}
          aoFechar={() => setEditarAlvo(null)}
          aoGuardar={() => {
            setEditarAlvo(null);
            qc.invalidateQueries({ queryKey: ["reservas"] });
          }}
        />
      )}
    </>
  );
}

function DialogoEditarReservaSala({
  reserva,
  exigeMotivo,
  aoFechar,
  aoGuardar }: {
  reserva: Reserva;
  exigeMotivo: boolean;
  aoFechar: () => void;
  aoGuardar: () => void;
}) {
  const [valor, setValor] = useState({
    data: paraInputData(reserva.data),
    horaInicio: paraInputHora(reserva.horaInicio),
    horaFim: paraInputHora(reserva.horaFim) });
  const [observacao, setObservacao] = useState(reserva.observacao ?? "");
  const [motivo, setMotivo] = useState("");

  const mut = useMutation({
    mutationFn: () =>
      reservasApi.editar(reserva.id, {
        data: valor.data,
        horaInicio: valor.horaInicio,
        horaFim: valor.horaFim,
        observacao: observacao || undefined,
        motivoEdicao: motivo || undefined }),
    onSuccess: () => {
      toast.success("Reserva actualizada");
      aoGuardar();
    },
    onError: (e: any) => toast.error(e.message) });

  const desactivado =
    mut.isPending ||
    !valor.data ||
    !valor.horaInicio ||
    !valor.horaFim ||
    (exigeMotivo && !motivo.trim());

  const horario = reserva.sala
    ? {
        inicio: reserva.sala.horaInicioFuncionamento,
        fim: reserva.sala.horaFimFuncionamento }
    : undefined;

  return (
    <Dialog open onOpenChange={(o) => !o && aoFechar()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar reserva</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label>Sala</Label>
            <Input value={reserva.sala?.nome ?? `Sala #${reserva.salaId}`} disabled />
          </div>
          <SeletorReserva
            horarioFuncionamento={horario}
            carregarDisponibilidade={async (data) => {
              const d = await reservasApi.disponibilidade(reserva.salaId, data);
              return d.intervalosLivres;
            }}
            valor={valor}
            aoMudar={setValor}
          />
          <div className="space-y-1">
            <Label>Observação</Label>
            <Textarea
              placeholder="Observação opcional"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
            />
          </div>
          {exigeMotivo && (
            <div className="space-y-1">
              <Label>Motivo da edição <span className="text-destructive">*</span></Label>
              <Textarea
                placeholder="Explique porque está a editar a reserva de outro utilizador"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={aoFechar} disabled={mut.isPending}>
            Cancelar
          </Button>
          <Button onClick={() => mut.mutate()} disabled={desactivado}>
            {mut.isPending ? "A guardar..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ListaReservasEq({ fonte }: { fonte: "minhas" | "todas" }) {
  const qc = useQueryClient();
  const { utilizador, temPapel } = useAuth();
  const ehGestor = temPapel("ADMIN", "FUNCIONARIO");
  const q = useQuery({
    queryKey: ["reservas-eq", fonte],
    queryFn: () =>
      fonte === "minhas" ? reservasEquipamentoApi.minhas() : reservasEquipamentoApi.listar() });
  const [pesquisa, setPesquisa] = useState("");
  const [status, setStatus] = useState<"todos" | StatusReserva>("todos");
  const [cancelarAlvo, setCancelarAlvo] = useState<ReservaEquipamento | null>(null);
  const [editarAlvo, setEditarAlvo] = useState<ReservaEquipamento | null>(null);

  const cancelar = useMutation({
    mutationFn: ({ id, motivo }: { id: number; motivo?: string }) =>
      reservasEquipamentoApi.cancelar(id, motivo),
    onSuccess: () => {
      toast.success("Reserva cancelada");
      qc.invalidateQueries({ queryKey: ["reservas-eq"] });
      setCancelarAlvo(null);
    },
    onError: (e: any) => toast.error(e.message) });

  const lista = useMemo(() => {
    const t = pesquisa.trim().toLowerCase();
    return (q.data ?? []).filter((r) => {
      if (status !== "todos" && r.status !== status) return false;
      if (!t) return true;
      return (
        (r.equipamento?.nome ?? "").toLowerCase().includes(t) ||
        (r.equipamento?.tipoEquipamento?.nome ?? "").toLowerCase().includes(t) ||
        (r.usuario?.nome ?? "").toLowerCase().includes(t)
      );
    });
  }, [q.data, pesquisa, status]);

  const { pagina, setPagina, totalPaginas, total, visiveis } = usePaginacao(lista, 10);

  return (
    <>
      <FiltrosLista
        pesquisa={pesquisa}
        setPesquisa={setPesquisa}
        status={status}
        setStatus={setStatus}
        placeholder="Pesquisar por equipamento, tipo ou utilizador..."
      />
      {q.isLoading ? (
        <p className="text-muted-foreground mt-4">A carregar...</p>
      ) : lista.length === 0 ? (
        <Card className="mt-4">
          <CardContent className="py-10 text-center text-muted-foreground">
            Sem reservas.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 mt-4">
          {visiveis.map((r) => (
            <Card key={r.id}>
              <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {r.equipamento?.nome ?? `Equipamento #${r.equipamentoId}`} ×
                    {r.quantidade}
                  </p>
                  {r.equipamento?.tipoEquipamento?.nome && (
                    <p className="text-xs text-muted-foreground">
                      {r.equipamento.tipoEquipamento.nome}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {formatarData(r.data)} · {formatarHora(r.horaInicio)} –{" "}
                    {formatarHora(r.horaFim)}
                  </p>
                  {r.usuario && fonte === "todas" && (
                    <p className="text-xs text-muted-foreground">por {r.usuario.nome}</p>
                  )}
                  <InfoAlteracoes reserva={r} />
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      r.status === "CONFIRMADA"
                        ? "bg-emerald-100 text-emerald-700"
                        : r.status === "CANCELADA"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {r.status}
                  </span>
                  {podeEditarReserva(r, utilizador, ehGestor) && (
                    <Button size="sm" variant="outline" onClick={() => setEditarAlvo(r)}>
                      <Pencil size={14} className="mr-1" /> Editar
                    </Button>
                  )}
                  {r.status === "CONFIRMADA" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCancelarAlvo(r)}
                    >
                      Cancelar
                    </Button>
                  )}
                  {(r.status === "CONFIRMADA" || r.status === "CONCLUIDA") && (
                    <BotaoComprovativo id={r.id} tipo="equipamento" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          <Paginacao
            pagina={pagina}
            totalPaginas={totalPaginas}
            total={total}
            aoMudar={setPagina}
          />
        </div>
      )}

      <DialogoCancelarReserva
        reserva={cancelarAlvo}
        exigeMotivo={!!cancelarAlvo && ehGestor && cancelarAlvo.usuarioId !== utilizador?.id}
        carregando={cancelar.isPending}
        aoFechar={() => setCancelarAlvo(null)}
        aoConfirmar={(motivo?: string) => cancelarAlvo && cancelar.mutate({ id: cancelarAlvo.id, motivo })}
      />

      {editarAlvo && (
        <DialogoEditarReservaEq
          reserva={editarAlvo}
          exigeMotivo={ehGestor && editarAlvo.usuarioId !== utilizador?.id}
          aoFechar={() => setEditarAlvo(null)}
          aoGuardar={() => {
            setEditarAlvo(null);
            qc.invalidateQueries({ queryKey: ["reservas-eq"] });
          }}
        />
      )}
    </>
  );
}

function DialogoEditarReservaEq({
  reserva,
  exigeMotivo,
  aoFechar,
  aoGuardar }: {
  reserva: ReservaEquipamento;
  exigeMotivo: boolean;
  aoFechar: () => void;
  aoGuardar: () => void;
}) {
  const [valor, setValor] = useState({
    data: paraInputData(reserva.data),
    horaInicio: paraInputHora(reserva.horaInicio),
    horaFim: paraInputHora(reserva.horaFim) });
  const [quantidade, setQuantidade] = useState(reserva.quantidade);
  const [observacao, setObservacao] = useState(reserva.observacao ?? "");
  const [motivo, setMotivo] = useState("");

  const mut = useMutation({
    mutationFn: () =>
      reservasEquipamentoApi.editar(reserva.id, {
        data: valor.data,
        horaInicio: valor.horaInicio,
        horaFim: valor.horaFim,
        quantidade,
        observacao: observacao || undefined,
        motivoEdicao: motivo || undefined }),
    onSuccess: () => {
      toast.success("Reserva actualizada");
      aoGuardar();
    },
    onError: (e: any) => toast.error(e.message) });

  const desactivado =
    mut.isPending ||
    quantidade < 1 ||
    !valor.data ||
    !valor.horaInicio ||
    !valor.horaFim ||
    (exigeMotivo && !motivo.trim());

  return (
    <Dialog open onOpenChange={(o) => !o && aoFechar()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar reserva de equipamento</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Equipamento</Label>
              <Input
                value={reserva.equipamento?.nome ?? `Equipamento #${reserva.equipamentoId}`}
                disabled
              />
            </div>
            <div className="space-y-1">
              <Label>Quantidade</Label>
              <Input
                type="number"
                min={1}
                value={quantidade}
                onChange={(e) => setQuantidade(Number(e.target.value))}
              />
            </div>
          </div>
          <SeletorReservaEquipamento
            quantidadePedida={quantidade || 1}
            carregar={(data) =>
              reservasEquipamentoApi.disponibilidade(reserva.equipamentoId, data)
            }
            valor={valor}
            aoMudar={setValor}
          />
          <div className="space-y-1">
            <Label>Observação</Label>
            <Textarea
              placeholder="Observação opcional"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
            />
          </div>
          {exigeMotivo && (
            <div className="space-y-1">
              <Label>Motivo da edição <span className="text-destructive">*</span></Label>
              <Textarea
                placeholder="Explique porque está a editar a reserva de outro utilizador"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={aoFechar} disabled={mut.isPending}>
            Cancelar
          </Button>
          <Button onClick={() => mut.mutate()} disabled={desactivado}>
            {mut.isPending ? "A guardar..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
