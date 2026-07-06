import { Link } from "@/lib/router-compat";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, DoorOpen, Package, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/autenticacao";
import {
  equipamentosApi,
  reservasApi,
  salasApi,
  utilizadoresApi } from "@/lib/api";

export default function Painel() {
  const { utilizador, temPapel } = useAuth();
  const ehAdmin = temPapel("ADMIN");

  const salas = useQuery({ queryKey: ["salas"], queryFn: salasApi.listar });
  const equipamentos = useQuery({
    queryKey: ["equipamentos"],
    queryFn: equipamentosApi.listar });
  const minhasReservas = useQuery({
    queryKey: ["reservas", "minhas"],
    queryFn: reservasApi.minhas });
  const todasReservas = useQuery({
    queryKey: ["reservas", "todas"],
    queryFn: () => reservasApi.listar(),
    enabled: ehAdmin });
  const utilizadores = useQuery({
    queryKey: ["utilizadores"],
    queryFn: utilizadoresApi.listar,
    enabled: ehAdmin });

  const cards = [
    {
      titulo: "Salas",
      total: salas.data?.length ?? "—",
      Icone: DoorOpen,
      para: "/salas",
      cor: "text-blue-600" },
    {
      titulo: "Equipamentos",
      total: equipamentos.data?.length ?? "—",
      Icone: Package,
      para: "/equipamentos",
      cor: "text-emerald-600" },
    {
      titulo: "Minhas reservas",
      total: minhasReservas.data?.length ?? "—",
      Icone: CalendarDays,
      para: "/reservas",
      cor: "text-violet-600" },
  ];

  if (ehAdmin) {
    cards.push({
      titulo: "Utilizadores",
      total: utilizadores.data?.length ?? "—",
      Icone: Users,
      para: "/admin/utilizadores",
      cor: "text-orange-600" });
  }

  // Dados do gráfico: contagem das reservas por estado.
  const fonte = ehAdmin ? todasReservas.data ?? [] : minhasReservas.data ?? [];
  const dadosGrafico = [
    {
      estado: "Confirmadas",
      total: fonte.filter((r) => r.status === "CONFIRMADA").length,
      cor: "hsl(142 71% 45%)" },
    {
      estado: "Canceladas",
      total: fonte.filter((r) => r.status === "CANCELADA").length,
      cor: "hsl(0 84% 60%)" },
    {
      estado: "Concluídas",
      total: fonte.filter((r) => r.status === "CONCLUIDA").length,
      cor: "hsl(217 91% 60%)" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Olá, {utilizador?.nome.split(" ")[0]} 👋
        </h1>
        <p className="text-muted-foreground mt-1">Bem-vindo ao painel de reservas.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ titulo, total, Icone, para, cor }) => (
          <Link key={titulo} to={para}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {titulo}
                </CardTitle>
                <Icone className={cor} size={20} />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{total}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>
              {ehAdmin ? "Reservas por estado (sistema)" : "Minhas reservas por estado"}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosGrafico}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="estado" stroke="hsl(var(--muted-foreground))" />
                <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" name="Reservas" radius={[6, 6, 0, 0]}>
                  {dadosGrafico.map((d, i) => (
                    <Cell key={i} fill={d.cor} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimas reservas</CardTitle>
          </CardHeader>
          <CardContent>
            {minhasReservas.isLoading ? (
              <p className="text-muted-foreground text-sm">A carregar...</p>
            ) : (minhasReservas.data?.length ?? 0) === 0 ? (
              <p className="text-muted-foreground text-sm">Ainda não tem reservas.</p>
            ) : (
              <ul className="divide-y divide-border">
                {minhasReservas.data!.slice(0, 5).map((r) => (
                  <li key={r.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{r.sala?.nome ?? `Sala #${r.salaId}`}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(r.data).toLocaleDateString("pt-PT")} ·{" "}
                        {new Date(r.horaInicio).toLocaleTimeString("pt-PT", {
                          hour: "2-digit",
                          minute: "2-digit" })}{" "}
                        –{" "}
                        {new Date(r.horaFim).toLocaleTimeString("pt-PT", {
                          hour: "2-digit",
                          minute: "2-digit" })}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground">
                      {r.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
