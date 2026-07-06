import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { tiposEquipamentoApi, tiposSalaApi } from "@/lib/api";
import { useGuardaAuth } from "@/lib/autenticacao";

export default function PaginaTipos() {
  useGuardaAuth(["ADMIN"]);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Tipos</h1>
        <p className="text-muted-foreground">Categorias de salas e equipamentos.</p>
      </div>
      <Tabs defaultValue="salas">
        <TabsList>
          <TabsTrigger value="salas">Tipos de sala</TabsTrigger>
          <TabsTrigger value="equipamentos">Tipos de equipamento</TabsTrigger>
        </TabsList>
        <TabsContent value="salas">
          <GestorTipos chave="tipos-sala" titulo="Tipo de sala" api={tiposSalaApi} />
        </TabsContent>
        <TabsContent value="equipamentos">
          <GestorTipos
            chave="tipos-equipamento"
            titulo="Tipo de equipamento"
            api={tiposEquipamentoApi}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface ApiTipo {
  listar: () => Promise<{ id: number; nome: string; descricao?: string | null }[]>;
  criar: (nome: string, descricao?: string) => Promise<any>;
  editar: (id: number, dados: { nome?: string; descricao?: string | null }) => Promise<any>;
  remover: (id: number) => Promise<any>;
}

interface Tipo {
  id: number;
  nome: string;
  descricao?: string | null;
}

function GestorTipos({
  chave,
  titulo,
  api }: {
  chave: string;
  titulo: string;
  api: ApiTipo;
}) {
  const qc = useQueryClient();
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [pesquisa, setPesquisa] = useState("");
  const [editar, setEditar] = useState<Tipo | null>(null);
  const [remover, setRemover] = useState<Tipo | null>(null);

  const q = useQuery({ queryKey: [chave], queryFn: api.listar });

  const criarMut = useMutation({
    mutationFn: () => api.criar(nome, descricao || undefined),
    onSuccess: () => {
      toast.success("Criado");
      setNome("");
      setDescricao("");
      qc.invalidateQueries({ queryKey: [chave] });
    },
    onError: (e: any) => toast.error(e.message) });

  const removerMut = useMutation({
    mutationFn: (id: number) => api.remover(id),
    onSuccess: () => {
      toast.success("Removido");
      qc.invalidateQueries({ queryKey: [chave] });
      setRemover(null);
    },
    onError: (e: any) => toast.error(e.message) });

  const lista = useMemo(() => {
    const t = pesquisa.trim().toLowerCase();
    if (!t) return q.data ?? [];
    return (q.data ?? []).filter(
      (x) =>
        x.nome.toLowerCase().includes(t) ||
        (x.descricao ?? "").toLowerCase().includes(t),
    );
  }, [q.data, pesquisa]);

  return (
    <div className="space-y-4 mt-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Adicionar {titulo.toLowerCase()}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3">
          <div className="space-y-1">
            <Label>Nome</Label>
            <Input
              placeholder="Ex: Sala de reuniões"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Descrição</Label>
            <Input
              placeholder="Descrição opcional"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={() => criarMut.mutate()} disabled={!nome || criarMut.isPending}>
              <Plus size={16} className="mr-2" /> Adicionar
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Pesquisar tipos..."
          className="pl-9"
          value={pesquisa}
          onChange={(e) => setPesquisa(e.target.value)}
        />
      </div>

      {q.isLoading ? (
        <p className="text-muted-foreground">A carregar...</p>
      ) : lista.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Nenhum tipo encontrado.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {lista.map((t) => (
            <Card key={t.id}>
              <CardContent className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">{t.nome}</p>
                  {t.descricao && (
                    <p className="text-sm text-muted-foreground truncate">{t.descricao}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditar(t)}>
                    <Pencil size={14} />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => setRemover(t)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {editar && (
        <DialogoEditar
          tipo={editar}
          titulo={titulo}
          api={api}
          aoFechar={() => setEditar(null)}
          aoGuardar={() => {
            setEditar(null);
            qc.invalidateQueries({ queryKey: [chave] });
          }}
        />
      )}

      <ConfirmDialog
        aberto={!!remover}
        titulo={`Remover "${remover?.nome ?? ""}"?`}
        descricao="Esta acção é permanente."
        textoConfirmar="Remover"
        variante="destrutiva"
        carregando={removerMut.isPending}
        aoCancelar={() => setRemover(null)}
        aoConfirmar={() => remover && removerMut.mutate(remover.id)}
      />
    </div>
  );
}

function DialogoEditar({
  tipo,
  titulo,
  api,
  aoFechar,
  aoGuardar }: {
  tipo: Tipo;
  titulo: string;
  api: ApiTipo;
  aoFechar: () => void;
  aoGuardar: () => void;
}) {
  const [nome, setNome] = useState(tipo.nome);
  const [descricao, setDescricao] = useState(tipo.descricao ?? "");
  const mut = useMutation({
    mutationFn: () => api.editar(tipo.id, { nome, descricao: descricao || null }),
    onSuccess: () => {
      toast.success("Actualizado");
      aoGuardar();
    },
    onError: (e: any) => toast.error(e.message) });

  return (
    <Dialog open onOpenChange={(o) => !o && aoFechar()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar {titulo.toLowerCase()}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Nome</Label>
            <Input
              placeholder="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Descrição</Label>
            <Input
              placeholder="Descrição opcional"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={aoFechar}>
            Cancelar
          </Button>
          <Button onClick={() => mut.mutate()} disabled={!nome || mut.isPending}>
            {mut.isPending ? "A guardar..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
