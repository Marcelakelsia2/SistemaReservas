import { useNavigate, useSearchParams } from "@/lib/router-compat";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { autenticacaoApi } from "@/lib/api";

export default function PaginaVerificar() {
  const [params] = useSearchParams();
  const emailInicial = params.get("email") ?? "";
  const navegar = useNavigate();
  const [email, setEmail] = useState(emailInicial);

  const [codigo, setCodigo] = useState("");
  const [a, setA] = useState(false);

  async function verificar(e: React.FormEvent) {
    e.preventDefault();
    setA(true);
    try {
      await autenticacaoApi.verificarEmail(email, codigo);
      toast.success("Email verificado! Pode iniciar sessão.");
      navegar({ to: "/login" });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setA(false);
    }
  }

  async function reenviar() {
    if (!email) return toast.error("Indique o email");
    try {
      await autenticacaoApi.reenviarCodigo(email);
      toast.success("Novo código enviado");
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Verificar email</CardTitle>
          <CardDescription>Introduza o código de 6 dígitos enviado por email</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={verificar} className="space-y-4">
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
              <Label htmlFor="codigo">Código</Label>
              <Input
                id="codigo"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
                required
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                placeholder="123456"
              />
            </div>
            <Button type="submit" className="w-full" disabled={a}>
              {a ? "A verificar..." : "Verificar"}
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={reenviar}>
              Reenviar código
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
