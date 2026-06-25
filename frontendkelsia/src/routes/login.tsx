import { Link, useNavigate } from "@/lib/router-compat";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/autenticacao";
import { LayoutPublico } from "@/components/LayoutPublico";
import { authService } from "@/services";

export default function PaginaLogin() {
  const { entrar, autenticado } = useAuth();
  const navegar = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [a, setA] = useState(false);

  useEffect(() => {
    if (autenticado) navegar({ to: "/painel" });
  }, [autenticado, navegar]);

  async function submeter(e: React.FormEvent) {
    e.preventDefault();
    setA(true);
    try {
      await entrar(email, senha);
      toast.success("Sessão iniciada com sucesso");
      navegar({ to: "/painel" });
    } catch (err: any) {
      toast.error(err.message || "Falha ao iniciar sessão");
    } finally {
      setA(false);
    }
  }

  function entrarComGoogle() {
    window.location.href = authService.urlGoogle();
  }

  return (
    <LayoutPublico>
    <div className="flex items-center justify-center p-4 py-12 md:py-20">

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Iniciar sessão</CardTitle>
          <CardDescription>Aceda à plataforma de reservas</CardDescription>
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                placeholder="A sua senha"
              />
            </div>
            <div className="text-right">
              <Link to="/recuperar-senha" className="text-sm text-primary hover:underline">
                Esqueceu a senha?
              </Link>
            </div>
            <Button type="submit" className="w-full" disabled={a}>
              {a ? "A entrar..." : "Entrar"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Ainda não verificou o seu email?{" "}
            <Link to="/verificar-email" className="text-primary hover:underline font-medium">
              Clique aqui
            </Link>
          </p>
          <p className="text-center text-sm text-muted-foreground mt-2">
            Ainda não tem conta?{" "}
            <Link to="/registar" className="text-primary hover:underline font-medium">
              Criar conta
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
    </LayoutPublico>
  );
}
