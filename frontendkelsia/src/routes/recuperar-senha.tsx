import { Link, useNavigate } from "@/lib/router-compat";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { autenticacaoApi } from "@/lib/api";

export default function PaginaRecuperar() {
  const navegar = useNavigate();
  const [etapa, setEtapa] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [a, setA] = useState(false);

  async function pedirCodigo(e: React.FormEvent) {
    e.preventDefault();
    setA(true);
    try {
      await autenticacaoApi.recuperarSenha(email);
      toast.success("Código enviado para o seu email");
      setEtapa(2);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setA(false);
    }
  }

  async function redefinir(e: React.FormEvent) {
    e.preventDefault();
    setA(true);
    try {
      await autenticacaoApi.redefinirSenha(email, codigo, novaSenha);
      toast.success("Senha redefinida! Pode iniciar sessão.");
      navegar({ to: "/login" });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setA(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Recuperar senha</CardTitle>
          <CardDescription>
            {etapa === 1
              ? "Indique o seu email para receber o código"
              : "Introduza o código e a nova senha"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {etapa === 1 ? (
            <form onSubmit={pedirCodigo} className="space-y-4">
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
              <Button type="submit" className="w-full" disabled={a}>
                {a ? "A enviar..." : "Enviar código"}
              </Button>
            </form>
          ) : (
            <form onSubmit={redefinir} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código</Label>
                <Input
                  id="codigo"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  required
                  maxLength={6}
                  inputMode="numeric"
                  placeholder="000000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="novaSenha">Nova senha</Label>
                <Input
                  id="novaSenha"
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  required
                  placeholder="Mínimo 8 caracteres"
                />
              </div>
              <Button type="submit" className="w-full" disabled={a}>
                {a ? "A redefinir..." : "Redefinir senha"}
              </Button>
            </form>
          )}
          <p className="text-center text-sm text-muted-foreground mt-6">
            <Link to="/login" className="text-primary hover:underline">
              Voltar ao login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
