import { Link, useNavigate } from "@/lib/router-compat";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { autenticacaoApi } from "@/lib/api";
import { LayoutPublico } from "@/components/LayoutPublico";
import { authService } from "@/services";

export const REGEX_SENHA = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const REGEX_NOME = /^[A-Za-zÀ-ÿ\s'.-]+$/;
const REGEX_TELEFONE = /^\d{9}$/;
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function PaginaRegistar() {
  const navegar = useNavigate();
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    senha: "",
    confirmarSenha: "" });
  const [a, setA] = useState(false);

  function alterar<K extends keyof typeof form>(campo: K, valor: string) {
    if (campo === "nome") {
      // remove dígitos
      valor = valor.replace(/[0-9]/g, "");
    } else if (campo === "telefone") {
      // apenas dígitos, máximo 9
      valor = valor.replace(/\D/g, "").slice(0, 9);
    }
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  const erros = useMemo(() => {
    const e: Record<string, string> = {};
    if (form.nome && !REGEX_NOME.test(form.nome)) {
      e.nome = "O nome não pode conter números.";
    }
    if (form.email && !REGEX_EMAIL.test(form.email)) {
      e.email = "Email inválido.";
    }
    if (form.telefone && !REGEX_TELEFONE.test(form.telefone)) {
      e.telefone = "O telefone deve ter exatamente 9 dígitos.";
    }
    if (form.senha && !REGEX_SENHA.test(form.senha)) {
      e.senha = "Mín. 8 caracteres, maiúscula, minúscula, número e símbolo.";
    }
    if (form.confirmarSenha && form.confirmarSenha !== form.senha) {
      e.confirmarSenha = "As senhas não coincidem.";
    }
    return e;
  }, [form]);

  async function submeter(e: React.FormEvent) {
    e.preventDefault();
    if (!REGEX_NOME.test(form.nome)) return toast.error("O nome não pode conter números");
    if (!REGEX_EMAIL.test(form.email)) return toast.error("Email inválido");
    if (!REGEX_TELEFONE.test(form.telefone)) return toast.error("O telefone deve ter exatamente 9 dígitos");
    if (form.senha !== form.confirmarSenha) return toast.error("As senhas não coincidem");
    if (!REGEX_SENHA.test(form.senha)) return toast.error("Senha não cumpre os requisitos");
    setA(true);
    try {
      const { confirmarSenha: _c, ...dados } = form;
      void _c;
      await autenticacaoApi.registar(dados);
      toast.success("Conta criada! Verifique o email recebido.");
      navegar({ to: "/verificar-email", search: { email: form.email } });
    } catch (err: any) {
      toast.error(err.message || "Erro ao registar");
    } finally {
      setA(false);
    }
  }

  function entrarComGoogle() {
    window.location.href = authService.urlGoogle();
  }

  return (
    <LayoutPublico>
    <div className="flex items-center justify-center p-4 py-12 md:py-16">

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Criar conta</CardTitle>
          <CardDescription>Registe-se para começar a reservar</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="outline"
            className="w-full mb-4 gap-2"
            onClick={entrarComGoogle}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path fill="#EA4335" d="M12 11v3.2h4.5c-.2 1.2-1.4 3.5-4.5 3.5-2.7 0-4.9-2.2-4.9-5s2.2-5 4.9-5c1.5 0 2.6.6 3.2 1.2l2.2-2.1C15.9 5.5 14.1 4.7 12 4.7 7.9 4.7 4.6 8 4.6 12s3.3 7.3 7.4 7.3c4.3 0 7.1-3 7.1-7.2 0-.5-.1-.9-.1-1.2H12z"/>
            </svg>
            Continuar com Google
          </Button>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">ou</span>
            </div>
          </div>
          <form onSubmit={submeter} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome completo</Label>
              <Input id="nome" value={form.nome} onChange={(e) => alterar("nome", e.target.value)} required placeholder="Ex: Kelsia Quissanva" />
              {erros.nome && <p className="text-xs text-destructive">{erros.nome}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => alterar("email", e.target.value)} required placeholder="seu@email.com" />
              {erros.email && <p className="text-xs text-destructive">{erros.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" inputMode="numeric" maxLength={9} value={form.telefone} onChange={(e) => alterar("telefone", e.target.value)} required placeholder="912345678" />
              {erros.telefone && <p className="text-xs text-destructive">{erros.telefone}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input id="senha" type="password" value={form.senha} onChange={(e) => alterar("senha", e.target.value)} required placeholder="Mínimo 8 caracteres" />
              {erros.senha ? (
                <p className="text-xs text-destructive">{erros.senha}</p>
              ) : (
                <p className="text-xs text-muted-foreground">Mín. 8 caracteres, maiúscula, minúscula, número e símbolo.</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmarSenha">Confirmar senha</Label>
              <Input
                id="confirmarSenha"
                type="password"
                value={form.confirmarSenha}
                onChange={(e) => alterar("confirmarSenha", e.target.value)}
                required
                placeholder="Repita a senha"
              />
              {erros.confirmarSenha && (
                <p className="text-xs text-destructive">{erros.confirmarSenha}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={a || Object.keys(erros).length > 0 || !form.confirmarSenha}
            >
              {a ? "A criar..." : "Criar conta"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Já tem conta?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Iniciar sessão
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
    </LayoutPublico>
  );
}