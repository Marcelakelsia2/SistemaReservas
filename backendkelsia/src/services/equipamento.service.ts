import { EstadoEquipamento } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { HttpError } from "../utils/httpError";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface EquipamentoPayload {
  codigo?: string;
  nome?: string;
  descricao?: string;
  estado?: EstadoEquipamento;
  quantidadeTotal?: number | string;
  tipoEquipamentoId?: number | string;
}

// ─── Helpers de validação ─────────────────────────────────────────────────────

function validarQuantidadeTotal(valor: number): void {
  if (!Number.isFinite(valor)) {
    throw new HttpError("Quantidade deve ser um número válido", 400);
  }
  if (valor < 0) {
    throw new HttpError("Quantidade não pode ser negativa", 400);
  }
}

// ─── CRIAR ────────────────────────────────────────────────────────────────────

export async function criar(data: EquipamentoPayload) {
  if (!data.codigo?.trim()) {
    throw new HttpError("Código é obrigatório", 400);
  }
  if (!data.nome?.trim()) {
    throw new HttpError("Nome é obrigatório", 400);
  }
  if (!data.tipoEquipamentoId) {
    throw new HttpError("Tipo de equipamento é obrigatório", 400);
  }
  if (data.quantidadeTotal === undefined) {
    throw new HttpError("Quantidade total é obrigatória", 400);
  }

  const quantidadeTotal = Number(data.quantidadeTotal);
  const tipoEquipamentoId = Number(data.tipoEquipamentoId);

  validarQuantidadeTotal(quantidadeTotal);

  const [existe, tipoEquipamento] = await Promise.all([
    prisma.equipamento.findFirst({ where: { codigo: data.codigo.trim() } }),
    prisma.tipoEquipamento.findUnique({ where: { id: tipoEquipamentoId } }),
  ]);

  if (existe) {
    throw new HttpError("Já existe um equipamento com este código", 409);
  }
  if (!tipoEquipamento) {
    throw new HttpError("Tipo de equipamento não encontrado", 404);
  }

  return prisma.equipamento.create({
    data: {
      codigo: data.codigo.trim(),
      nome: data.nome.trim(),
      descricao: data.descricao,
      estado: data.estado,
      quantidadeTotal,
      tipoEquipamentoId,
    },
    include: { tipoEquipamento: true },
  });
}

// ─── LISTAR ───────────────────────────────────────────────────────────────────

export async function listar() {
  return prisma.equipamento.findMany({
    include: { tipoEquipamento: true },
    orderBy: { nome: "asc" },
  });
}

// ─── VER ──────────────────────────────────────────────────────────────────────

export async function ver(id: number) {
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError("ID inválido", 400);
  }

  const equipamento = await prisma.equipamento.findUnique({
    where: { id },
    include: { tipoEquipamento: true },
  });

  if (!equipamento) {
    throw new HttpError("Equipamento não encontrado", 404);
  }

  return equipamento;
}

// ─── EDITAR ───────────────────────────────────────────────────────────────────

export async function editar(id: number, data: EquipamentoPayload) {
  await ver(id);

  if (data.codigo) {
    const existe = await prisma.equipamento.findFirst({
      where: { codigo: data.codigo.trim(), NOT: { id } },
    });
    if (existe) {
      throw new HttpError("Já existe outro equipamento com este código", 409);
    }
  }

  if (data.quantidadeTotal !== undefined) {
    validarQuantidadeTotal(Number(data.quantidadeTotal));
  }

  if (data.tipoEquipamentoId) {
    const tipoEquipamento = await prisma.tipoEquipamento.findUnique({
      where: { id: Number(data.tipoEquipamentoId) },
    });
    if (!tipoEquipamento) {
      throw new HttpError("Tipo de equipamento não encontrado", 404);
    }
  }

  return prisma.equipamento.update({
    where: { id },
    data: {
      codigo: data.codigo?.trim(),
      nome: data.nome?.trim(),
      descricao: data.descricao,
      estado: data.estado,
      quantidadeTotal: data.quantidadeTotal !== undefined
        ? Number(data.quantidadeTotal)
        : undefined,
      tipoEquipamentoId: data.tipoEquipamentoId
        ? Number(data.tipoEquipamentoId)
        : undefined,
    },
    include: { tipoEquipamento: true },
  });
}

// ─── ALTERAR DISPONIBILIDADE ──────────────────────────────────────────────────

const ESTADOS_VALIDOS: EstadoEquipamento[] = ["DISPONIVEL", "INDISPONIVEL", "MANUTENCAO"];

export async function alterarDisponibilidade(id: number, estado: string) {
  await ver(id);

  if (!ESTADOS_VALIDOS.includes(estado as EstadoEquipamento)) {
    throw new HttpError(
      `Estado inválido. Use: ${ESTADOS_VALIDOS.join(", ")}`,
      400
    );
  }

  return prisma.equipamento.update({
    where: { id },
    data: { estado: estado as EstadoEquipamento },
  });
}

// ─── ALTERAR QUANTIDADE ───────────────────────────────────────────────────────

export async function alterarQuantidade(id: number, quantidadeTotal: number) {
  await ver(id);

  validarQuantidadeTotal(quantidadeTotal);

  return prisma.equipamento.update({
    where: { id },
    data: { quantidadeTotal },
  });
}

// ─── DISPONÍVEIS ──────────────────────────────────────────────────────────────

export async function disponiveis() {
  return prisma.equipamento.findMany({
    where: {
      estado: "DISPONIVEL",
      quantidadeTotal: { gt: 0 },
    },
    include: { tipoEquipamento: true },
    orderBy: { nome: "asc" },
  });
}

// ─── REMOVER ──────────────────────────────────────────────────────────────────

export async function remover(id: number) {
  await ver(id);

  const emUso = await prisma.reservaEquipamento.findFirst({
    where: { equipamentoId: id },
  });

  if (emUso) {
    throw new HttpError(
      "Não é possível remover equipamento com reservas associadas",
      409
    );
  }

  return prisma.equipamento.delete({ where: { id } });
}