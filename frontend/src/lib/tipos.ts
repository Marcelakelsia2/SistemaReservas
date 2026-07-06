// Tipos e enums partilhados pelo frontend (alinhados com o backend Prisma)

export type Papel = "ADMIN" | "FUNCIONARIO" | "USUARIO";
export type EstadoSala = "DISPONIVEL" | "INDISPONIVEL" | "MANUTENCAO";
export type EstadoEquipamento = "DISPONIVEL" | "INDISPONIVEL" | "MANUTENCAO";
export type StatusReserva = "CONFIRMADA" | "CANCELADA" | "CONCLUIDA";

export interface Utilizador {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  role: Papel;
  ativo?: boolean;
  emailVerificado?: boolean;
  dataCriacao?: string;
}

export interface TipoSala {
  id: number;
  nome: string;
  descricao?: string | null;
}

export interface Sala {
  id: number;
  nome: string;
  capacidade: number;
  localizacao: string;
  descricao?: string | null;
  estado: EstadoSala;
  horaInicioFuncionamento: string;
  horaFimFuncionamento: string;
  tipoSalaId: number;
  tipoSala?: TipoSala;
}

export interface TipoEquipamento {
  id: number;
  nome: string;
  descricao?: string | null;
}

export interface Equipamento {
  id: number;
  codigo: string;
  nome: string;
  descricao?: string | null;
  quantidadeTotal: number;
  estado: EstadoEquipamento;
  tipoEquipamentoId: number;
  tipoEquipamento?: TipoEquipamento;
}

export interface AlteradoPor {
  id: number;
  nome: string;
  role: Papel;
}

export interface Reserva {
  id: number;
  usuarioId: number;
  salaId: number;
  sala?: Sala;
  usuario?: Utilizador;
  data: string;
  horaInicio: string;
  horaFim: string;
  status: StatusReserva;
  observacao?: string | null;
  dataCriacao?: string;
  motivoCancelamento?: string | null;
  motivoEdicao?: string | null;
  alteradoPor?: AlteradoPor | null;
  alteradoPorId?: number | null;
  updatedAt?: string;
}

export interface ReservaEquipamento {
  id: number;
  usuarioId: number;
  equipamentoId: number;
  equipamento?: Equipamento;
  usuario?: Utilizador;
  quantidade: number;
  data: string;
  horaInicio: string;
  horaFim: string;
  status: StatusReserva;
  observacao?: string | null;
  motivoCancelamento?: string | null;
  motivoEdicao?: string | null;
  alteradoPor?: AlteradoPor | null;
  alteradoPorId?: number | null;
  updatedAt?: string;
}

export interface RespostaLogin {
  token: string;
  refreshToken: string;
  usuario: Utilizador;
}
