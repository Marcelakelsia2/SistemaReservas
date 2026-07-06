export { armazenamento, ErroApi, mensagemErro } from "@/services";
import {
  authService,
  utilizadoresService,
  tiposSalaService,
  tiposEquipamentoService,
  salasService,
  equipamentosService,
  reservasService,
  reservasEquipamentoService,
} from "@/services";

export const autenticacaoApi = authService;

export const utilizadoresApi = {
  ...utilizadoresService,
  listar: () => utilizadoresService.listar().then((r) => r.dados),
};
export const tiposSalaApi = tiposSalaService;
export const tiposEquipamentoApi = tiposEquipamentoService;
export const salasApi = salasService;
export const equipamentosApi = equipamentosService;
export const reservasApi = reservasService;
export const reservasEquipamentoApi = reservasEquipamentoService;
