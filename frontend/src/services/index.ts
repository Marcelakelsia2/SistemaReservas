export { http, armazenamento, ErroApi, mensagemErro, URL_BASE } from "./http";
export { authService } from "./auth.service";
export { utilizadoresService } from "./utilizadores.service";
export type { MetaPaginacao, RespostaPaginada, AtualizarPerfilDados } from "./utilizadores.service";
export { tiposSalaService } from "./tiposSala.service";
export { tiposEquipamentoService } from "./tiposEquipamento.service";
export { salasService } from "./salas.service";
export { equipamentosService } from "./equipamentos.service";
export { reservasService } from "./reservas.service";
export type {
  DisponibilidadeSala,
  CriarReservaInput,
  EditarReservaInput,
} from "./reservas.service";
export { reservasEquipamentoService } from "./reservasEquipamento.service";
export type {
  DisponibilidadeEquipamento,
  CriarReservaEqInput,
  EditarReservaEqInput,
} from "./reservasEquipamento.service";
