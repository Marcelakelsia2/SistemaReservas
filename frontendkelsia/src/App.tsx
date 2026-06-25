import { Routes, Route, Navigate, Outlet, Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useGuardaAuth } from "@/lib/autenticacao";

import Inicio from "./routes/index";
import PaginaLogin from "./routes/login";
import PaginaRegistar from "./routes/registar";
import PaginaRecuperar from "./routes/recuperar-senha";
import PaginaVerificar from "./routes/verificar-email";
import PaginaOAuthSucesso from "./routes/oauth.sucesso";
import Painel from "./routes/_app.painel";
import PaginaSalas from "./routes/_app.salas";
import PaginaEquipamentos from "./routes/_app.equipamentos";
import PaginaReservas from "./routes/_app.reservas";
import PaginaPerfil from "./routes/_app.perfil";
import PaginaTipos from "./routes/_app.admin.tipos";
import PaginaUtilizadores from "./routes/_app.admin.utilizadores";

function AppLayout() {
  const { pronto } = useGuardaAuth();
  if (!pronto) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">A carregar...</p>
      </div>
    );
  }
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A página que procura não existe ou foi movida.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/login" element={<PaginaLogin />} />
      <Route path="/registar" element={<PaginaRegistar />} />
      <Route path="/recuperar-senha" element={<PaginaRecuperar />} />
      <Route path="/verificar-email" element={<PaginaVerificar />} />
      <Route path="/oauth/sucesso" element={<PaginaOAuthSucesso />} />
      <Route element={<AppLayout />}>
        <Route path="/painel" element={<Painel />} />
        <Route path="/salas" element={<PaginaSalas />} />
        <Route path="/equipamentos" element={<PaginaEquipamentos />} />
        <Route path="/reservas" element={<PaginaReservas />} />
        <Route path="/perfil" element={<PaginaPerfil />} />
        <Route path="/admin/tipos" element={<PaginaTipos />} />
        <Route path="/admin/utilizadores" element={<PaginaUtilizadores />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

