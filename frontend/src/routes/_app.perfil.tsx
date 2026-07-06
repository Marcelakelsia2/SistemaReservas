import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { utilizadoresApi } from "@/lib/api";
import { useAuth } from "@/lib/autenticacao";

const REGEX_SENHA = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8 }$/;
const REGEX_NOME = /^[A-Za-zÀ-ÿ\s'.-]+$/;
const REGEX_TELEFONE = /^\d{9}$/;
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function PaginaPerfil() {
  const { utilizador, atualizarUtilizador } = useAuth();
  const [nome, setNome] = useState(utilizador?.nome ?? "");
  const [telefone, setTelefone] = useState(utilizador?.telefone ?? "");
  const [email, setEmail] = useState(utilizador?.email ?? "");

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState("");

  const errosDados = useMemo(() => {
    const e: Record<string, string> = {};
    if (nome && !REGEX_NOME.test(nome)) e.nome = "O nome não pode conter números.";
    if (email && !REGEX_EMAIL.test(email)) e.email = "Email inválido.";
    if (telefone && !REGEX_TELEFONE.test(telefone)) e.telefone = "O telefone não pode conter letras.";
    return e;
  }, [nome, email, telefone]);

  const errosSenha = useMemo(() => {
    const e: Record<string, string> = {};
    if (novaSenha && !REGEX_SENHA.test(novaSenha)) {
      e.nova = "Mín. 8 caracteres, maiúscula, minúscula, número e símbolo.";
    }
    if (confirmarNovaSenha && confirmarNovaSenha !== novaSenha) {
      e.confirmar = "As senhas não coincidem.";
    }
    return e;
  }, [novaSenha, confirmarNovaSenha]);

  const atualizar = useMutation({
    mutationFn: () => utilizadoresApi.atualizarPerfil({ nome, telefone, email }),
    onSuccess: (u) => {
      atualizarUtilizador(u);
      toast.success("Perfil actualizado");
    },
    onError: (e: any) => toast.error(e.message) });

  function submeterDados() {
    if (!REGEX_NOME.test(nome)) return toast.error("O nome não pode conter números");
    if (!REGEX_EMAIL.test(email)) return toast.error("Email inválido");
    if (!REGEX_TELEFONE.test(telefone)) return toast.error("O telefone não pode conter letras");
    atualizar.mutate();
  }

  const alterarSenha = useMutation({
    mutationFn: () => utilizadoresApi.alterarPalavraPasse(senhaAtual, novaSenha),
    onSuccess: () => {
      toast.success("Senha alterada");
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarNovaSenha("");
    },
    onError: (e: any) => toast.error(e.message) });

  function submeterSenha() {
    if (novaSenha !== confirmarNovaSenha) {
      toast.error("As senhas não coincidem");
      return;
    }
    if (!REGEX_SENHA.test(novaSenha)) {
      toast.error("Senha não cumpre os requisitos");
      return;
    }
    alterarSenha.mutate();
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Perfil</h1>
        <p className="text-muted-foreground">Gerir os seus dados pessoais.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados pessoais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label>Nome</Label>
            <Input
              placeholder="Ex: Kelsia Quissanva"
              value={nome}
              onChange={(e) => setNome(e.target.value.replace(/[0-9]/g, ""))}
            />
            {errosDados.nome && <p className="text-xs text-destructive">{errosDados.nome}</p>}
          </div>
          <div className="space-y-1">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errosDados.email && <p className="text-xs text-destructive">{errosDados.email}</p>}
          </div>
          <div className="space-y-1">
            <Label>Telefone</Label>
            <Input
              inputMode="tel"
              placeholder="922345678"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value.replace(/[A-Za-zÀ-ÿ]/g, ""))}
            />
            {errosDados.telefone && <p className="text-xs text-destructive">{errosDados.telefone}</p>}
          </div>
          <Button
            onClick={submeterDados}
            disabled={atualizar.isPending || Object.keys(errosDados).length > 0}
          >
            {atualizar.isPending ? "A guardar..." : "Guardar alterações"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alterar senha</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label>Senha actual</Label>
            <Input
              type="password"
              placeholder="Senha actual"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Nova senha</Label>
            <Input
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
            />
            {errosSenha.nova ? (
              <p className="text-xs text-destructive">{errosSenha.nova}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Mín. 8 caracteres, maiúscula, minúscula, número e símbolo.
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label>Confirmar nova senha</Label>
            <Input
              type="password"
              placeholder="Repita a nova senha"
              value={confirmarNovaSenha}
              onChange={(e) => setConfirmarNovaSenha(e.target.value)}
            />
            {errosSenha.confirmar && (
              <p className="text-xs text-destructive">{errosSenha.confirmar}</p>
            )}
          </div>
          <Button
            onClick={submeterSenha}
            disabled={
              !senhaAtual ||
              !novaSenha ||
              !confirmarNovaSenha ||
              !!errosSenha.nova ||
              !!errosSenha.confirmar ||
              alterarSenha.isPending
            }
          >
            {alterarSenha.isPending ? "A alterar..." : "Alterar senha"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
