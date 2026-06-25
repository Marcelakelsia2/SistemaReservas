// Layout principal da aplicação autenticada — sidebar responsiva + topbar.
import { Link, useRouterState } from "@/lib/router-compat";
import { useState } from "react";
import {
  CalendarDays,
  DoorOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  User,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/autenticacao";

interface ItemMenu {
  para: string;
  rotulo: string;
  Icone: typeof LayoutDashboard;
  apenasAdmin?: boolean;
}

const itensMenu: ItemMenu[] = [
  { para: "/painel", rotulo: "Painel", Icone: LayoutDashboard },
  { para: "/salas", rotulo: "Salas", Icone: DoorOpen },
  { para: "/equipamentos", rotulo: "Equipamentos", Icone: Package },
  { para: "/reservas", rotulo: "Reservas", Icone: CalendarDays },
  { para: "/perfil", rotulo: "Perfil", Icone: User },
  { para: "/admin/utilizadores", rotulo: "Utilizadores", Icone: Users, apenasAdmin: true },
  { para: "/admin/tipos", rotulo: "Tipos", Icone: Settings, apenasAdmin: true },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { utilizador, sair, temPapel } = useAuth();
  const [aberto, setAberto] = useState(false);
  const caminho = useRouterState({ select: (s) => s.location.pathname });

  const itensVisiveis = itensMenu.filter((i) => !i.apenasAdmin || temPapel("ADMIN"));

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-200 flex flex-col",
          aberto ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">Reservas</h1>
            <p className="text-xs text-muted-foreground">Salas & Equipamentos</p>
          </div>
          <button
            className="lg:hidden text-muted-foreground"
            onClick={() => setAberto(false)}
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {itensVisiveis.map(({ para, rotulo, Icone }) => {
            const ativo = caminho === para || caminho.startsWith(para + "/");
            return (
              <Link
                key={para}
                to={para}
                onClick={() => setAberto(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  ativo
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icone size={18} />
                {rotulo}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium text-foreground truncate">{utilizador?.nome}</p>
            <p className="text-xs text-muted-foreground truncate">{utilizador?.email}</p>
            <p className="text-xs text-primary mt-1">{utilizador?.role}</p>
          </div>
          <Button variant="outline" className="w-full justify-start" onClick={() => sair()}>
            <LogOut size={16} className="mr-2" />
            Terminar sessão
          </Button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {aberto && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setAberto(false)}
        />
      )}

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden border-b border-border bg-card px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setAberto(true)}
            className="text-foreground"
            aria-label="Abrir menu"
          >
            <Menu size={22} />
          </button>
          <span className="font-semibold">Reservas</span>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
