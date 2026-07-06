import { Router } from "express";

import utilizadoresRoutes from "./utilizadores.routes";
import autenticacaoRoutes from "./autenticacao.routes";
import tipoSalaRoutes from "./tiposSala.routes";
import salaSRoutes from "./salas.routes";
import tipoEquipamentoRoutes from "./tiposEquipamento.routes";
import equipamentoRoutes from "./equipamentos.routes";
import reservasRoutes from "./reservas.routes";
import reservasEquipamentoRoutes from "./reservaEquipamento.routes";
import oauthRoutes from "./oauth.routes";

const rotas = Router();

rotas.use("/auth", oauthRoutes);
rotas.use("/autenticacao", autenticacaoRoutes);
rotas.use("/utilizadores", utilizadoresRoutes);
rotas.use("/tipos-sala", tipoSalaRoutes);
rotas.use("/salas", salaSRoutes);
rotas.use("/tipos-equipamento", tipoEquipamentoRoutes);
rotas.use("/equipamentos", equipamentoRoutes);
rotas.use("/reservas", reservasRoutes);
rotas.use("/reservas-equipamentos", reservasEquipamentoRoutes);
export default rotas;