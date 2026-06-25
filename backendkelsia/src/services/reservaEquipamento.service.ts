import { prisma } from "../lib/prisma";
import { HttpError } from "../utils/httpError";

// TIPOS

interface UsuarioReq {
  id: number;
  role: "ADMIN" | "FUNCIONARIO" | "USUARIO";
}

interface CriarPayload {
  equipamentoId?: number | string;
  quantidade?: number | string;
  data?: string;
  horaInicio?: string;
  horaFim?: string;
  observacao?: string;
}

interface EditarPayload {
  equipamentoId?: number | string;
  quantidade?: number | string;
  data?: string;
  horaInicio?: string;
  horaFim?: string;
  observacao?: string;
  motivoEdicao?: string;
}

// VALIDAÇÕES

function validarHorario(inicio: Date, fim: Date): void {
  if (inicio >= fim) {
    throw new HttpError("Hora de início deve ser menor que a hora de fim", 400);
  }
}

function construirData(data: string, hora: string): Date {
  const dt = new Date(`${data}T${hora}:00`);
  if (isNaN(dt.getTime())) {
    throw new HttpError("Data ou hora inválida", 400);
  }
  return dt;
}

//ACTUALIZAR CONCLUÍDAS

export async function atualizarConcluidas() {
  return prisma.reservaEquipamento.updateMany({
    where: {
      status: "CONFIRMADA",
      horaFim: { lte: new Date() },
    },
    data: { status: "CONCLUIDA" },
  });
}

// ─── VERIFICAR CONFLITO DE QUANTIDADE ─────────────────────────────────────────

async function verificarConflitoEquipamento(
  equipamentoId: number,
  quantidadeSolicitada: number,
  inicio: Date,
  fim: Date,
  excluirReservaId?: number
): Promise<void> {
  const equipamento = await prisma.equipamento.findUnique({
    where: { id: equipamentoId },
  });

  if (!equipamento) {
    throw new HttpError("Equipamento não encontrado", 404);
  }

  if (equipamento.estado !== "DISPONIVEL") {
    throw new HttpError(
      `Equipamento indisponível (estado: ${equipamento.estado})`,
      400
    );
  }

  const reservasConflitantes = await prisma.reservaEquipamento.findMany({
    where: {
      equipamentoId,
      status: { notIn: ["CANCELADA", "CONCLUIDA"] },
      ...(excluirReservaId ? { NOT: { id: excluirReservaId } } : {}),
      AND: [{ horaInicio: { lt: fim } }, { horaFim: { gt: inicio } }],
    },
  });

  const quantidadeReservada = reservasConflitantes.reduce(
    (total, r) => total + r.quantidade,
    0
  );

  const quantidadeDisponivel = equipamento.quantidadeTotal - quantidadeReservada;

  if (quantidadeSolicitada > quantidadeDisponivel) {
    throw new HttpError(
      `Quantidade indisponível. Restam apenas ${quantidadeDisponivel} unidade(s) para este horário.`,
      409
    );
  }
}

// ─── CRIAR ────────────────────────────────────────────────────────────────────

export async function criar(data: CriarPayload, usuarioId: number) {
  if (!data.equipamentoId) {
    throw new HttpError("Equipamento é obrigatório", 400);
  }
  if (!data.data) {
    throw new HttpError("Data é obrigatória", 400);
  }
  if (!data.horaInicio) {
    throw new HttpError("Hora de início é obrigatória", 400);
  }
  if (!data.horaFim) {
    throw new HttpError("Hora de fim é obrigatória", 400);
  }
  if (data.quantidade === undefined || data.quantidade === null) {
    throw new HttpError("Quantidade é obrigatória", 400);
  }

  const quantidade = Number(data.quantidade);

  if (!Number.isInteger(quantidade) || quantidade <= 0) {
    throw new HttpError("Quantidade deve ser um número inteiro maior que zero", 400);
  }

  const inicio = construirData(data.data, data.horaInicio);
  const fim = construirData(data.data, data.horaFim);

  validarHorario(inicio, fim);

  if (inicio < new Date()) {
    throw new HttpError(
      "Não é possível criar reservas com horário no passado",
      400
    );
  }

  await verificarConflitoEquipamento(
    Number(data.equipamentoId),
    quantidade,
    inicio,
    fim
  );

  return prisma.reservaEquipamento.create({
    data: {
      usuarioId,
      equipamentoId: Number(data.equipamentoId),
      quantidade,
      data: new Date(data.data),
      horaInicio: inicio,
      horaFim: fim,
      observacao: data.observacao,
      status: "CONFIRMADA",
    },
    include: {
      equipamento: { include: { tipoEquipamento: true } },
    },
  });
}

// ─── LISTAR ───────────────────────────────────────────────────────────────────

export async function listar() {
  return prisma.reservaEquipamento.findMany({
    include: {
      equipamento: { include: { tipoEquipamento: true } },
      usuario: {
        select: { id: true, nome: true, email: true },
      },
    },
    orderBy: { data: "desc" },
  });
}

// ─── MINHAS RESERVAS ──────────────────────────────────────────────────────────

export async function minhas(usuarioId: number) {
  return prisma.reservaEquipamento.findMany({
    where: { usuarioId },
    include: {
      equipamento: { include: { tipoEquipamento: true } },
    },
    orderBy: { data: "desc" },
  });
}

// ─── VER ──────────────────────────────────────────────────────────────────────

export async function ver(id: number, usuario: UsuarioReq) {
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError("ID inválido", 400);
  }

  const reserva = await prisma.reservaEquipamento.findUnique({
    where: { id },
    include: {
      equipamento: { include: { tipoEquipamento: true } },
      usuario: {
        select: { id: true, nome: true, email: true },
      },
      alteradoPor: {
        select: { id: true, nome: true, role: true },
      },
    },
  });

  if (!reserva) {
    throw new HttpError("Reserva não encontrada", 404);
  }

  if (usuario.role === "USUARIO" && reserva.usuarioId !== usuario.id) {
    throw new HttpError("Sem permissão para ver esta reserva", 403);
  }

  return reserva;
}

// ─── CANCELAR ─────────────────────────────────────────────────────────────────

export async function cancelar(id: number, usuario: UsuarioReq, motivo?: string) {
  const reserva = await ver(id, usuario);

  if (reserva.status === "CONCLUIDA") {
    throw new HttpError("Não é possível cancelar uma reserva concluída", 400);
  }

  if (reserva.status === "CANCELADA") {
    throw new HttpError("Reserva já está cancelada", 400);
  }

  const ehOutraReserva = reserva.usuarioId !== usuario.id;
  const ehPrivilegiado =
    usuario.role === "ADMIN" || usuario.role === "FUNCIONARIO";

  if (ehOutraReserva && ehPrivilegiado) {
    if (!motivo || motivo.trim() === "") {
      throw new HttpError(
        "Motivo é obrigatório ao cancelar a reserva de outro utilizador",
        400
      );
    }
  }

  return prisma.reservaEquipamento.update({
    where: { id },
    data: {
      status: "CANCELADA",
      motivoCancelamento: motivo?.trim() ?? null,
      alteradoPorId: ehOutraReserva && ehPrivilegiado ? usuario.id : null,
    },
  });
}

// ─── EDITAR ───────────────────────────────────────────────────────────────────

export async function editar(id: number, usuario: UsuarioReq, data: EditarPayload) {
  const reserva = await ver(id, usuario);

  if (reserva.status === "CANCELADA") {
    throw new HttpError("Não é possível editar uma reserva cancelada", 400);
  }

  if (reserva.status === "CONCLUIDA") {
    throw new HttpError("Não é possível editar uma reserva concluída", 400);
  }

  const ehOutraReserva = reserva.usuarioId !== usuario.id;
  const ehPrivilegiado =
    usuario.role === "ADMIN" || usuario.role === "FUNCIONARIO";

  if (ehOutraReserva && ehPrivilegiado) {
    if (!data.motivoEdicao || data.motivoEdicao.trim() === "") {
      throw new HttpError(
        "Motivo é obrigatório ao editar a reserva de outro utilizador",
        400
      );
    }
  }

  const dataStr = data.data
    ? data.data
    : reserva.data.toISOString().split("T")[0];

  const horaInicio = data.horaInicio
    ? data.horaInicio
    : reserva.horaInicio.toTimeString().slice(0, 5);

  const horaFim = data.horaFim
    ? data.horaFim
    : reserva.horaFim.toTimeString().slice(0, 5);

  const inicio = construirData(dataStr, horaInicio);
  const fim = construirData(dataStr, horaFim);

  validarHorario(inicio, fim);

  if (inicio < new Date()) {
    throw new HttpError(
      "Não é possível editar para um horário no passado",
      400
    );
  }

  const quantidade =
    data.quantidade !== undefined
      ? Number(data.quantidade)
      : reserva.quantidade;

  if (!Number.isInteger(quantidade) || quantidade <= 0) {
    throw new HttpError("Quantidade deve ser um número inteiro maior que zero", 400);
  }

  const equipamentoId = data.equipamentoId
    ? Number(data.equipamentoId)
    : reserva.equipamentoId;

  await verificarConflitoEquipamento(equipamentoId, quantidade, inicio, fim, id);

  return prisma.reservaEquipamento.update({
    where: { id },
    data: {
      equipamentoId,
      quantidade,
      data: new Date(dataStr),
      horaInicio: inicio,
      horaFim: fim,
      observacao: data.observacao ?? reserva.observacao,
      motivoEdicao:
        ehOutraReserva && ehPrivilegiado ? data.motivoEdicao!.trim() : null,
      alteradoPorId: ehOutraReserva && ehPrivilegiado ? usuario.id : null,
    },
    include: {
      equipamento: { include: { tipoEquipamento: true } },
      alteradoPor: {
        select: { id: true, nome: true, role: true },
      },
    },
  });
}

// ─── DISPONIBILIDADE ──────────────────────────────────────────────────────────

export async function disponibilidade(equipamentoId: number, data: string) {
  if (!Number.isInteger(equipamentoId) || equipamentoId <= 0) {
    throw new HttpError("ID de equipamento inválido", 400);
  }

  if (!data || data === "undefined") {
    throw new HttpError("Data é obrigatória", 400);
  }

  const equipamento = await prisma.equipamento.findUnique({
    where: { id: equipamentoId },
    include: { tipoEquipamento: true },
  });

  if (!equipamento) {
    throw new HttpError("Equipamento não encontrado", 404);
  }

  const inicioDia = new Date(`${data}T00:00:00`);
  const fimDia = new Date(`${data}T23:59:59`);

  if (isNaN(inicioDia.getTime())) {
    throw new HttpError("Formato de data inválido. Use YYYY-MM-DD", 400);
  }

  const reservas = await prisma.reservaEquipamento.findMany({
    where: {
      equipamentoId,
      status: { notIn: ["CANCELADA", "CONCLUIDA"] },
      horaInicio: { gte: inicioDia },
      horaFim: { lte: fimDia },
    },
    orderBy: { horaInicio: "asc" },
  });

  const reservasFormatadas = reservas.map((reserva) => {
    const sobrepostas = reservas.filter(
      (r) =>
        r.id !== reserva.id &&
        r.horaInicio < reserva.horaFim &&
        r.horaFim > reserva.horaInicio
    );
    const totalOcupado =
      sobrepostas.reduce((acc, r) => acc + r.quantidade, 0) + reserva.quantidade;

    return {
      id: reserva.id,
      quantidadeReservada: reserva.quantidade,
      quantidadeDisponivel: Math.max(0, equipamento.quantidadeTotal - totalOcupado),
      horaInicio: reserva.horaInicio,
      horaFim: reserva.horaFim,
      status: reserva.status,
    };
  });

  return {
    equipamentoId,
    equipamento: equipamento.nome,
    tipoEquipamento: equipamento.tipoEquipamento.nome,
    quantidadeTotal: equipamento.quantidadeTotal,
    reservas: reservasFormatadas,
  };
}

//COMPROVATIVO
export async function comprovativo(id: number, usuario: UsuarioReq) {
  const reserva = await prisma.reservaEquipamento.findUnique({
    where: { id },
    include: {
      equipamento: { include: { tipoEquipamento: true } },
      usuario: {
        select: { id: true, nome: true, email: true },
      },
    },
  });

  if (!reserva) throw new HttpError("Reserva não encontrada", 404);

  if (usuario.role === "USUARIO" && reserva.usuarioId !== usuario.id) {
    throw new HttpError("Sem permissão", 403);
  }

  return reserva;
}