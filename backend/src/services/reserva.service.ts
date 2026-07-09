import { prisma } from "../lib/prisma";
import { HttpError } from "../utils/httpError";

// VALIDAR HORÁRIO
function validarHorario(inicio: Date, fim: Date) {
  if (inicio >= fim) {
    throw new HttpError("Hora de início deve ser menor que a hora de fim", 400);
  }
}
// CONFLITO SALA
async function verificarConflitoSala(
  salaId: number,
  inicio: Date,
  fim: Date,
  excluirReservaId?: number
) {

  
  const conflito = await prisma.reserva.findFirst({
    where: {
      salaId,
      status: { not: "CANCELADA" },
      ...(excluirReservaId ? { id: { not: excluirReservaId } } : {}),
      AND: [{ horaInicio: { lt: fim } }, { horaFim: { gt: inicio } }],
    },
  });

  if (conflito) {
    throw new HttpError("Conflito de horário na sala", 400);
  }
}

// ATUALIZA RESERVAS CONCLUÍDAS
export async function atualizarConcluidas() {
  return prisma.reserva.updateMany({
    where: {
      status: "CONFIRMADA",
      horaFim: {
        lt: new Date(),
      },
    },
    data: {
      status: "CONCLUIDA",
    },
  });
}

// CRIAR RESERVA
export async function criar(data: any, usuarioId: number) {
  const sala = await prisma.sala.findUnique({
    where: { id: data.salaId },
  });

  if (!sala) {
    throw new HttpError("Sala não encontrada", 404);
  }

  if (!data.data) {
    throw new HttpError("Data é obrigatória", 400);
  }

  const hoje = new Date();
  const dataReserva = new Date(data.data);

  hoje.setHours(0, 0, 0, 0);
  dataReserva.setHours(0, 0, 0, 0);

  if (dataReserva < hoje) {
    throw new HttpError("Não é possível criar reservas em datas passadas", 400);
  }

 const inicio = new Date(`${data.data}T${data.horaInicio}:00`);
 const fim = new Date(`${data.data}T${data.horaFim}:00`);

if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
  throw new HttpError(
    `Data/Hora inválida. Data=${data.data}, Inicio=${data.horaInicio}, Fim=${data.horaFim}`,
    400
  );
}

validarHorario(inicio, fim);    

  const agora = new Date();
  if (inicio < agora) {
    throw new HttpError(
      "Não é possível criar reservas com horário no passado",
      400
    );
  }

  const converterHoraParaMinutos = (hora: string) => {
    const [h, m] = hora.split(":").map(Number);
    return h * 60 + m;
  };

  const inicioMin = inicio.getHours() * 60 + inicio.getMinutes();
  const fimMin = fim.getHours() * 60 + fim.getMinutes();
  const inicioSala = converterHoraParaMinutos(sala.horaInicioFuncionamento);
  const fimSala = converterHoraParaMinutos(sala.horaFimFuncionamento);

  if (inicioMin < inicioSala || fimMin > fimSala) {
    throw new HttpError(
      `Reserva fora do horário da sala (${sala.horaInicioFuncionamento} - ${sala.horaFimFuncionamento})`,
      400
    );
  }

  

  await verificarConflitoSala(data.salaId, inicio, fim);

  return prisma.reserva.create({
    data: {
      usuarioId,
      salaId: data.salaId,
      horaInicio: inicio,
      horaFim: fim,
      data: new Date(data.data),
      observacao: data.observacao,
      status: "CONFIRMADA",
    },
  });
}

// LISTAR TODAS
export async function listar() {
  return prisma.reserva.findMany({
    include: {
      sala: true,
      usuario: {
        select: {
          id: true,
          nome: true,
          email: true,
        },
      },
      alteradoPor: {
        select: {
          id: true,
          nome: true,
          role: true,
        },
      },
    },
    orderBy: { dataCriacao: "desc" },
  });
}

// MINHAS RESERVAS
export async function minhas(usuarioId: number) {
  return prisma.reserva.findMany({
    where: { usuarioId },
    include: {
      sala: true,
      alteradoPor: {
        select: {
          id: true,
          nome: true,
          role: true,
        },
      },
    },
    orderBy: { dataCriacao: "desc" },
  });
}

// VER RESERVA
export async function ver(id: number, usuario: any) {
  const reserva = await prisma.reserva.findUnique({
    where: { id },
    include: {
      sala: true,
      alteradoPor: {
        select: {
          id: true,
          nome: true,
          role: true,
        },
      },
    },
  });

  if (!reserva) {
    throw new HttpError("Reserva não encontrada", 404);
  }

  if (usuario.role === "USUARIO" && reserva.usuarioId !== usuario.id) {
    throw new HttpError("Sem permissão", 403);
  }

  return reserva;
}

//
// CANCELAR
//
export async function cancelar(id: number, usuario: any, motivo?: string) {
  const reserva = await ver(id, usuario);

  if (reserva.status === "CONCLUIDA") {
    throw new HttpError("Não é possível cancelar uma reserva concluída", 400);
  }

  if (reserva.status === "CANCELADA") {
    throw new HttpError("Reserva já está cancelada", 400);
  }

  // Admin ou funcionário a cancelar reserva de outro utilizador — motivo obrigatório
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
  return prisma.reserva.update({
    where: { id },
    data: {
      status: "CANCELADA",
      motivoCancelamento: motivo?.trim() ?? null,
      alteradoPorId: ehOutraReserva && ehPrivilegiado ? usuario.id : null,
    },
  });
}

// EDITAR RESERVA
export async function editar(id: number, usuario: any, data: any) {
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

  // Usar a data fornecida ou manter a original
  const dataStr = data.data
    ? data.data
    : reserva.data.toISOString().split("T")[0];

  const horaInicio = data.horaInicio
    ? data.horaInicio
    : reserva.horaInicio.toTimeString().slice(0, 5);

  const horaFim = data.horaFim
    ? data.horaFim
    : reserva.horaFim.toTimeString().slice(0, 5);

  const inicio = new Date(`${dataStr}T${horaInicio}:00`);
  const fim = new Date(`${dataStr}T${horaFim}:00`);

  validarHorario(inicio, fim);

  const agora = new Date();
  if (inicio < agora) {
    throw new HttpError(
      "Não é possível editar para um horário no passado",
      400
    );
  }

  // Validar horário da sala
  const sala = await prisma.sala.findUnique({
    where: { id: data.salaId ?? reserva.salaId },
  });

  if (!sala) {
    throw new HttpError("Sala não encontrada", 404);
  }

  const converterHoraParaMinutos = (hora: string) => {
    const [h, m] = hora.split(":").map(Number);
    return h * 60 + m;
  };

  const inicioMin = inicio.getHours() * 60 + inicio.getMinutes();
  const fimMin = fim.getHours() * 60 + fim.getMinutes();
  const inicioSala = converterHoraParaMinutos(sala.horaInicioFuncionamento);
  const fimSala = converterHoraParaMinutos(sala.horaFimFuncionamento);

  if (inicioMin < inicioSala || fimMin > fimSala) {
    throw new HttpError(
      `Reserva fora do horário da sala (${sala.horaInicioFuncionamento} - ${sala.horaFimFuncionamento})`,
      400
    );
  }

  const salaId = data.salaId ?? reserva.salaId;
  await verificarConflitoSala(salaId, inicio, fim, id);

  return prisma.reserva.update({
    where: { id },
    data: {
      salaId,
      horaInicio: inicio,
      horaFim: fim,
      data: new Date(dataStr),
      observacao: data.observacao ?? reserva.observacao,
      motivoEdicao:
        ehOutraReserva && ehPrivilegiado ? data.motivoEdicao.trim() : null,
      alteradoPorId: ehOutraReserva && ehPrivilegiado ? usuario.id : null,
    },
    include: {
      sala: true,
      alteradoPor: {
        select: { id: true, nome: true, role: true },
      },
    },
  });
}
// DISPONIBILIDADE DA SALA
export async function disponibilidade(salaId: number, data: string) {
  const sala = await prisma.sala.findUnique({
    where: { id: salaId },
  });

  if (!sala) {
    throw new HttpError("Sala não encontrada", 404);
  }

  const inicioDia = new Date(`${data}T00:00:00`);
  const fimDia = new Date(`${data}T23:59:59`);

  const reservas = await prisma.reserva.findMany({
    where: {
      salaId,
      status: { not: "CANCELADA" },
      horaInicio: { gte: inicioDia },
      horaFim: { lte: fimDia },
    },
    select: {
      id: true,
      horaInicio: true,
      horaFim: true,
      status: true,
    },
    orderBy: { horaInicio: "asc" },
  });

  const intervalosLivres: { inicio: string; fim: string }[] = [];

  const formatarHora = (data: Date) => data.toTimeString().slice(0, 5);

  let cursor = sala.horaInicioFuncionamento;

  for (const reserva of reservas) {
    const inicioReserva = formatarHora(reserva.horaInicio);
    const fimReserva = formatarHora(reserva.horaFim);

    if (cursor < inicioReserva) {
      intervalosLivres.push({ inicio: cursor, fim: inicioReserva });
    }

    cursor = fimReserva;
  }

  if (cursor < sala.horaFimFuncionamento) {
    intervalosLivres.push({ inicio: cursor, fim: sala.horaFimFuncionamento });
  }

  return {
    salaId,
    horaInicioFuncionamento: sala.horaInicioFuncionamento,
    horaFimFuncionamento: sala.horaFimFuncionamento,
    diaTotalmenteOcupado: intervalosLivres.length === 0,
    intervalosLivres,
  };
}

//COMPROVATIVO
export async function comprovativo(id: number, usuario: any) {
  const reserva = await prisma.reserva.findUnique({
    where: { id },
    include: {
      sala: true,
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
