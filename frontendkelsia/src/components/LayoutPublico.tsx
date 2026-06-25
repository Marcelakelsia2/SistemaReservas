import { Link } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";
import { CalendarCheck2, Mail, Phone } from "lucide-react";
import type { ReactNode } from "react";

export const CONTACTO_EMAIL = "marcelakelsia2003@gmail.com";
export const CONTACTO_TELEFONE_E164 = "+244923693971";
export const CONTACTO_TELEFONE_DISPLAY = "+244 923 693 971";

export function LayoutPublico({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CabecalhoPublico />
      <main className="flex-1">{children}</main>
      <RodapePublico />
    </div>
  );
}

export function CabecalhoPublico() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Faixa superior com contactos */}
      <div className="hidden md:block border-b bg-muted/40">
        <div className="max-w-6xl mx-auto px-4 h-9 flex items-center justify-end gap-6 text-xs text-muted-foreground">
          <a
            href={`mailto:${CONTACTO_EMAIL}`}
            className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <Mail size={14} /> {CONTACTO_EMAIL}
          </a>
          <a
            href={`tel:${CONTACTO_TELEFONE_E164}`}
            className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <Phone size={14} /> {CONTACTO_TELEFONE_DISPLAY}
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="inline-flex items-center gap-2 font-bold text-lg">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <CalendarCheck2 size={18} />
          </span>
          <span>Reservas</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link to="/login">Iniciar sessão</Link>
          </Button>
          <Button asChild>
            <Link to="/registar">Criar conta</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

export function RodapePublico() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <div className="inline-flex items-center gap-2 font-bold text-lg">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <CalendarCheck2 size={16} />
            </span>
            Reservas
          </div>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">
            Plataforma simples e rápida para gerir reservas de salas e equipamentos.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-foreground">Navegação</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-foreground">Início</Link></li>
            <li><Link to="/login" className="hover:text-foreground">Iniciar sessão</Link></li>
            <li><Link to="/registar" className="hover:text-foreground">Criar conta</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-foreground">Contactos</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <a
                href={`mailto:${CONTACTO_EMAIL}`}
                className="inline-flex items-center gap-2 hover:text-foreground"
              >
                <Mail size={14} /> {CONTACTO_EMAIL}
              </a>
            </li>
            <li>
              <a
                href={`tel:${CONTACTO_TELEFONE_E164}`}
                className="inline-flex items-center gap-2 hover:text-foreground"
              >
                <Phone size={14} /> {CONTACTO_TELEFONE_DISPLAY}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Reservas · Todos os direitos reservados
        </div>
      </div>
    </footer>
  );
}
