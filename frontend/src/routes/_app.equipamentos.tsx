import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Download, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Paginacao } from "@/components/Paginacao";
import { usePaginacao } from "@/hooks/usePaginacao";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  equipamentosApi,
  reservasEquipamentoApi,
  tiposEquipamentoApi } from "@/lib/api";
import { SeletorReservaEquipamento } from "@/components/SeletorReservaEquipamento";
import type { Equipamento } from "@/lib/tipos";

const estados = ["DISPONIVEL", "INDISPONIVEL", "MANUTENCAO"] as const;

export default function PaginaEquipamentos() {
  const { temPapel } = useAuth();
  const qc = useQueryClient();
  const ehAdmin = temPapel("ADMIN");

  const { data: equipamentos, isLoading } = useQuery({
    queryKey: ["equipamentos"],
    queryFn: equipamentosApi.listar });
  const { data: tipos } = useQuery({
    queryKey: ["tipos-equipamento"],
    queryFn: tiposEquipamentoApi.listar });

  const [editar, setEditar] = useState<Equipamento | null>(null);
  const [criarAberto, setCriarAberto] = useState(false);
  const [reservar, setReservar] = useState<Equipamento | null>(null);
  const [pesquisa, setPesquisa] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [removerAlvo, setRemoverAlvo] = useState<Equipamento | null>(null);

  const lista = useMemo(() => {
    const t = pesquisa.trim().toLowerCase();
    return (equipamentos ?? []).filter((e) => {
      if (filtroTipo !== "todos" && String(e.tipoEquipamentoId) !== filtroTipo) return false;
      if (!t) return true;
      return (
        e.nome.toLowerCase().includes(t) ||
        e.codigo.toLowerCase().includes(t) ||
        (e.tipoEquipamento?.nome ?? "").toLowerCase().includes(t)
      );
    });
  }, [equipamentos, pesquisa, filtroTipo]);

  const { pagina, setPagina, totalPaginas, total, visiveis } = usePaginacao(lista, 9);

  const remover = useMutation({
    mutationFn: (id: number) => equipamentosApi.remover(id),
    onSuccess: () => {
      toast.success("Equipamento removido");
      qc.invalidateQueries({ queryKey: ["equipamentos"] });
      setRemoverAlvo(null);
    },
    onError: (e: any) => toast.error(e.message) });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Equipamentos</h1>
          <p className="text-muted-foreground">Consulte e reserve equipamentos.</p>
        </div>
        {ehAdmin && (
          <Dialog open={criarAberto} onOpenChange={setCriarAberto}>
            <DialogTrigger asChild>
              <Button>
                <Plus size={16} className="mr-2" /> Novo
              </Button>
            </DialogTrigger>
            <FormularioEquipamento
              tipos={tipos ?? []}
              aoTerminar={() => {
                setCriarAberto(false);
                qc.invalidateQueries({ queryKey: ["equipamentos"] });
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
            placeholder="Pesquisar por nome, código ou tipo..."
            className="pl-9"
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
          />
        </div>
        <Select value={filtroTipo} onValueChange={setFiltroTipo}>
          <SelectTrigger>
            <SelectValue placeholder="Tipo de equipamento" />
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
            Nenhum equipamento encontrado.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {visiveis.map((eq) => (
              <Card key={eq.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg">{eq.nome}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">#{eq.codigo}</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        eq.estado === "DISPONIVEL"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {eq.estado}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">Tipo:</span>{" "}
                    {eq.tipoEquipamento?.nome ?? "—"}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Quantidade:</span>{" "}
                    {eq.quantidadeTotal}
                  </p>
                  {eq.descricao && (
                    <p className="text-muted-foreground italic">{eq.descricao}</p>
                  )}
                  <div className="flex flex-wrap gap-2 pt-3">
                    <Button
                      size="sm"
                      onClick={() => setReservar(eq)}
                      disabled={eq.estado !== "DISPONIVEL"}
                    >
                      Reservar
                    </Button>
                    {ehAdmin && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => setEditar(eq)}>
                          <Pencil size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setRemoverAlvo(eq)}
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
        titulo={`Remover "${removerAlvo?.nome ?? ""}"?`}
        descricao="Esta acção é permanente e remove o equipamento do sistema."
        textoConfirmar="Remover"
        variante="destrutiva"
        carregando={remover.isPending}
        aoCancelar={() => setRemoverAlvo(null)}
        aoConfirmar={() => removerAlvo && remover.mutate(removerAlvo.id)}
      />

      {editar && (
        <Dialog open onOpenChange={(o) => !o && setEditar(null)}>
          <FormularioEquipamento
            equipamento={editar}
            tipos={tipos ?? []}
            aoTerminar={() => {
              setEditar(null);
              qc.invalidateQueries({ queryKey: ["equipamentos"] });
            }}
          />
        </Dialog>
      )}

      {reservar && (
        <Dialog open onOpenChange={(o) => !o && setReservar(null)}>
          <DialogoReservaEq equipamento={reservar} aoTerminar={() => setReservar(null)} />
        </Dialog>
      )}

    </div>
  );
}

function FormularioEquipamento({
  equipamento,
  tipos,
  aoTerminar }: {
  equipamento?: Equipamento;
  tipos: { id: number; nome: string }[];
  aoTerminar: () => void;
}) {
  const [form, setForm] = useState({
    codigo: equipamento?.codigo ?? "",
    nome: equipamento?.nome ?? "",
    descricao: equipamento?.descricao ?? "",
    quantidadeTotal: equipamento?.quantidadeTotal ?? 1,
    estado: equipamento?.estado ?? "DISPONIVEL",
    tipoEquipamentoId: equipamento?.tipoEquipamentoId ?? tipos[0]?.id ?? 0 });

  const mut = useMutation({
    mutationFn: () =>
      equipamento
        ? equipamentosApi.editar(equipamento.id, form as any)
        : equipamentosApi.criar(form as any),
    onSuccess: () => {
      toast.success(equipamento ? "Actualizado" : "Criado");
      aoTerminar();
    },
    onError: (e: any) => toast.error(e.message) });

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {equipamento ? "Editar equipamento" : "Novo equipamento"}
        </DialogTitle>
      </DialogHeader>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Código</Label>
          <Input
            placeholder="Ex: EQP-001"
            value={form.codigo}
            onChange={(e) => setForm({ ...form, codigo: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <Label>Nome</Label>
          <Input placeholder="Ex: Projector Epson" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
        </div>
        <div className="space-y-1">
          <Label>Quantidade total</Label>
          <Input
            type="number"
            min={1}
            placeholder="Ex: 10"
            value={form.quantidadeTotal}
            onChange={(e) => setForm({ ...form, quantidadeTotal: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-1">
          <Label>Tipo</Label>
          <Select
            value={String(form.tipoEquipamentoId)}
            onValueChange={(v) => setForm({ ...form, tipoEquipamentoId: Number(v) })}
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
            placeholder="Descrição opcional"
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

function DialogoReservaEq({
  equipamento,
  aoTerminar }: {
  equipamento: Equipamento;
  aoTerminar: () => void;
}) {
  const qc = useQueryClient();
  const [quantidade, setQuantidade] = useState(1);
  const [valor, setValor] = useState({ data: "", horaInicio: "", horaFim: "" });
  const [obs, setObs] = useState("");
  const [criada, setCriada] = useState<{ id: number } | null>(null);
  const [aBaixar, setABaixar] = useState(false);

  const mut = useMutation({
    mutationFn: () =>
      reservasEquipamentoApi.criar({
        equipamentoId: equipamento.id,
        quantidade,
        data: valor.data,
        horaInicio: valor.horaInicio,
        horaFim: valor.horaFim,
        observacao: obs || undefined }),
    onSuccess: (r: any) => {
      toast.success("Reserva criada");
      qc.invalidateQueries({ queryKey: ["reservas-eq"] });
      setCriada({ id: r?.id });
    },
    onError: (e: any) => toast.error(e.message) });

  async function baixar() {
    if (!criada?.id) return;
    setABaixar(true);
    try {
      await reservasEquipamentoApi.baixarComprovativo(criada.id);
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
          A sua reserva de <strong>{equipamento.nome}</strong> foi criada com sucesso. Pode baixar
          o comprovativo agora ou mais tarde na página de Reservas.
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
        <DialogTitle>Reservar — {equipamento.nome}</DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        <div className="space-y-1">
          <Label>Quantidade (máx. {equipamento.quantidadeTotal})</Label>
          <Input
            type="number"
            min={1}
            max={equipamento.quantidadeTotal}
            value={quantidade}
            onChange={(e) => {
              setQuantidade(Number(e.target.value));
              setValor((v) => ({ ...v, horaInicio: "", horaFim: "" }));
            }}
          />
        </div>
        <SeletorReservaEquipamento
          quantidadePedida={quantidade}
          carregar={(data) => reservasEquipamentoApi.disponibilidade(equipamento.id, data)}
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
          {mut.isPending ? "A reservar..." : "Confirmar"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
