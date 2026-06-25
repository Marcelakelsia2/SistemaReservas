import { Link, useNavigate } from "@/lib/router-compat";
import { useEffect } from "react";
import { useAuth } from "@/lib/autenticacao";
import { Button } from "@/components/ui/button";
import { CalendarDays, DoorOpen, Laptop } from "lucide-react";
import { LayoutPublico } from "@/components/LayoutPublico";

export default function Inicio() {
  const { autenticado, carregando } = useAuth();
  const navegar = useNavigate();

  useEffect(() => {
    if (!carregando && autenticado) {
      navegar({ to: "/painel" });
    }
  }, [autenticado, carregando, navegar]);

  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">A carregar...</p>
      </div>
    );
  }

  if (autenticado) return null;

  return (
    <LayoutPublico>
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
          Reserve salas e equipamentos com facilidade
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Plataforma simples e rápida para gerir reservas de salas e equipamentos da sua
          organização.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" asChild>
            <Link to="/registar">Começar agora</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/login">Já tenho conta</Link>
          </Button>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-20 grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border p-6">
          <DoorOpen className="h-8 w-8 text-primary" />
          <h3 className="mt-4 font-semibold text-lg">Salas</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Consulte disponibilidade e reserve salas em poucos cliques.
          </p>
        </div>
        <div className="rounded-lg border p-6">
          <Laptop className="h-8 w-8 text-primary" />
          <h3 className="mt-4 font-semibold text-lg">Equipamentos</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Faça a gestão das reservas dos equipamentos disponíveis.
          </p>
        </div>
        <div className="rounded-lg border p-6">
          <CalendarDays className="h-8 w-8 text-primary" />
          <h3 className="mt-4 font-semibold text-lg">Calendário</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Organize as suas reservas com uma visão clara do calendário.
          </p>
        </div>
      </section>
    </LayoutPublico>
  );
}
