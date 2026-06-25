import { EstadoSala } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { HttpError } from "../utils/httpError";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface SalaPayload {
  nome?: string;
  capacidade?: number | string;
  localizacao?: string;
  descricao?: string;
  estado?: EstadoSala;
  horaInicioFuncionamento?: string;
  horaFimFuncionamento?: string;
  tipoSalaId?: number | string;
}

interface DisponibilidadeQuery {
  data?: string;
  horaInicio?: string;
  horaFim?: string;
  capacidadeMinima?: number | string;
}

// ─── Helpers de validação ─────────────────────────────────────────────────────

function validarHora(hora: string): void {
  const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!regex.test(hora)) {
    throw new HttpError("Formato de hora inválido. Use HH:mm", 400);
  }
}

function validarHorario(inicio: string, fim: string): void {
  validarHora(inicio);
  validarHora(fim);

  const dataInicio = new Date(`1970-01-01T${inicio}:00`);
  const dataFim = new Date(`1970-01-01T${fim}:00`);

  if (dataInicio >= dataFim) {
    throw new HttpError(
      "Hora de início deve ser menor que hora de fim",
      400
    );
  }
}

function validarNumeroPositivo(valor: number, campo: string): void {
  if (!Number.isFinite(valor) || valor <= 0) {
    throw new HttpError(`${campo} deve ser maior que zero`, 400);
  }
}

// ─── CRIAR ────────────────────────────────────────────────────────────────────

export async function criar(data: SalaPayload) {
  if (!data.nome?.trim()) {
    throw new HttpError("Nome é obrigatório", 400);
  }
  if (!data.capacidade) {
    throw new HttpError("Capacidade é obrigatória", 400);
  }
  if (!data.localizacao?.trim()) {
    throw new HttpError("Localização é obrigatória", 400);
  }
  if (!data.tipoSalaId) {
    throw new HttpError("Tipo da sala é obrigatório", 400);
  }
  if (!data.horaInicioFuncionamento || !data.horaFimFuncionamento) {
    throw new HttpError(
      "Horários de funcionamento (início e fim) são obrigatórios",
      400
    );
  }

  const capacidade = Number(data.capacidade);
  const tipoSalaId = Number(data.tipoSalaId);

  validarNumeroPositivo(capacidade, "Capacidade");
  validarNumeroPositivo(tipoSalaId, "Tipo da sala");
  validarHorario(
    data.horaInicioFuncionamento,
    data.horaFimFuncionamento
  );

  const [salaExistente, tipoSala] = await Promise.all([
    prisma.sala.findFirst({ where: { nome: data.nome.trim() } }),
    prisma.tipoSala.findUnique({ where: { id: tipoSalaId } }),
  ]);

  if (salaExistente) {
    throw new HttpError("Já existe uma sala com este nome", 409);
  }
  if (!tipoSala) {
    throw new HttpError("Tipo de sala não encontrado", 404);
  }

  return prisma.sala.create({
    data: {
      nome: data.nome.trim(),
      capacidade,
      localizacao: data.localizacao.trim(),
      descricao: data.descricao,
      estado: data.estado,
      horaInicioFuncionamento: data.horaInicioFuncionamento,
      horaFimFuncionamento: data.horaFimFuncionamento,
      tipoSalaId,
    },
    include: { tipoSala: true },
  });
}

// ─── LISTAR ───────────────────────────────────────────────────────────────────

export async function listar() {
  return prisma.sala.findMany({
    include: { tipoSala: true },
    orderBy: { nome: "asc" },
  });
}

// ─── VER ──────────────────────────────────────────────────────────────────────

export async function ver(id: number) {
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError("ID inválido", 400);
  }

  const sala = await prisma.sala.findUnique({
    where: { id },
    include: { tipoSala: true },
  });

  if (!sala) {
    throw new HttpError("Sala não encontrada", 404);
  }

  return sala;
}

// ─── EDITAR ───────────────────────────────────────────────────────────────────

export async function editar(id: number, data: SalaPayload) {
  // Garante que a sala existe antes de qualquer outra coisa
  const salaAtual = await ver(id);

  if (data.capacidade !== undefined) {
    validarNumeroPositivo(Number(data.capacidade), "Capacidade");
  }

  // Valida horário usando os valores enviados OU os já salvos na sala,
  // garantindo que a combinação final seja sempre consistente.
  const horaInicio =
    data.horaInicioFuncionamento ?? salaAtual.horaInicioFuncionamento;
  const horaFim =
    data.horaFimFuncionamento ?? salaAtual.horaFimFuncionamento;

  if (data.horaInicioFuncionamento || data.horaFimFuncionamento) {
    validarHorario(horaInicio, horaFim);
  }

  if (data.nome) {
    const salaExistente = await prisma.sala.findFirst({
      where: { nome: data.nome.trim(), NOT: { id } },
    });
    if (salaExistente) {
      throw new HttpError("Já existe outra sala com este nome", 409);
    }
  }

  if (data.tipoSalaId) {
    const tipoSalaId = Number(data.tipoSalaId);
    validarNumeroPositivo(tipoSalaId, "Tipo da sala");
    const tipoSala = await prisma.tipoSala.findUnique({
      where: { id: tipoSalaId },
    });
    if (!tipoSala) {
      throw new HttpError("Tipo de sala não encontrado", 404);
    }
  }

  return prisma.sala.update({
    where: { id },
    data: {
      nome: data.nome?.trim(),
      capacidade: data.capacidade ? Number(data.capacidade) : undefined,
      localizacao: data.localizacao?.trim(),
      descricao: data.descricao,
      estado: data.estado,
      horaInicioFuncionamento: data.horaInicioFuncionamento,
      horaFimFuncionamento: data.horaFimFuncionamento,
      tipoSalaId: data.tipoSalaId ? Number(data.tipoSalaId) : undefined,
    },
    include: { tipoSala: true },
  });
}

// ─── ALTERAR DISPONIBILIDADE ──────────────────────────────────────────────────

const ESTADOS_VALIDOS: EstadoSala[] = ["DISPONIVEL", "INDISPONIVEL", "MANUTENCAO"];

export async function alterarDisponibilidade(id: number, estado: string) {
  await ver(id);

  if (!ESTADOS_VALIDOS.includes(estado as EstadoSala)) {
    throw new HttpError(
      `Estado inválido. Use: ${ESTADOS_VALIDOS.join(", ")}`,
      400
    );
  }

  return prisma.sala.update({
    where: { id },
    data: { estado: estado as EstadoSala },
  });
}

// ─── REMOVER ──────────────────────────────────────────────────────────────────

export async function remover(id: number) {
  await ver(id);

  const reserva = await prisma.reserva.findFirst({ where: { salaId: id } });
  if (reserva) {
    throw new HttpError(
      "Não é possível remover sala com reservas associadas",
      409
    );
  }

  return prisma.sala.delete({ where: { id } });
}

// ─── SALAS DISPONÍVEIS ────────────────────────────────────────────────────────

export async function disponiveis(data: DisponibilidadeQuery) {
  //  validações centralizadas aqui, antes de qualquer uso dos campos
  if (!data.data) {
    throw new HttpError("Data é obrigatória", 400);
  }
  if (!data.horaInicio) {
    throw new HttpError("Hora de início é obrigatória", 400);
  }
  if (!data.horaFim) {
    throw new HttpError("Hora de fim é obrigatória", 400);
  }

  validarHorario(data.horaInicio, data.horaFim);

  const inicio = new Date(`${data.data}T${data.horaInicio}:00`);
  const fim = new Date(`${data.data}T${data.horaFim}:00`);

  if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
    throw new HttpError("Data inválida", 400);
  }

  const reservasConflito = await prisma.reserva.findMany({
    where: {
      status: { not: "CANCELADA" },
      horaInicio: { lt: fim },
      horaFim: { gt: inicio },
    },
    select: { salaId: true },
  });

  const salasIndisponiveis = reservasConflito.map((r) => r.salaId);

  //  só retorna salas cujo horário de funcionamento cobre o intervalo pedido
  return prisma.sala.findMany({
    where: {
      estado: "DISPONIVEL",
      id: { notIn: salasIndisponiveis },
      horaInicioFuncionamento: { lte: data.horaInicio },
      horaFimFuncionamento: { gte: data.horaFim },
      ...(data.capacidadeMinima
        ? { capacidade: { gte: Number(data.capacidadeMinima) } }
        : {}),
    },
    include: { tipoSala: true },
    orderBy: { nome: "asc" },
  });
}