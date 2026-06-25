import { prisma } from "../lib/prisma";
import { HttpError } from "../utils/httpError";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizarNome(nome: string): string {
  return nome.trim().replace(/\s+/g, " ");
}

async function buscarPorIdOuFalhar(id: number) {
  const tipo = await prisma.tipoEquipamento.findUnique({ where: { id } });
  if (!tipo) throw new HttpError("Tipo de equipamento não encontrado.", 404);
  return tipo;
}

// ─── CRIAR ────────────────────────────────────────────────────────────────────

export async function criar(nome: string, descricao?: string) {
  //  tipagem explícita em vez de `any`
  const nomeNormalizado = normalizarNome(nome);

  if (!nomeNormalizado) {
    throw new HttpError("O nome do tipo de equipamento não pode estar vazio.", 400);
  }

  //  comparação case-insensitive — evita "Projetor" e "projetor" coexistirem
  const existe = await prisma.tipoEquipamento.findFirst({
    where: { nome: { equals: nomeNormalizado, mode: "insensitive" } },
  });

  if (existe) {
    throw new HttpError("Já existe um tipo de equipamento com este nome.", 409);
  }

  const descricaoNormalizada = descricao?.trim() || null;

  const tipo = await prisma.tipoEquipamento.create({
    data: { nome: nomeNormalizado, descricao: descricaoNormalizada },
  });

  return { sucesso: true, dados: tipo };
}

// ─── LISTAR (com paginação) ───────────────────────────────────────────────────

export interface PaginacaoOpcoes {
  pagina?: number;
  limite?: number;
}

export async function listar(opcoes: PaginacaoOpcoes = {}) {
  const pagina = Math.max(1, opcoes.pagina ?? 1);
  const limite = Math.min(100, Math.max(1, opcoes.limite ?? 20));
  const skip = (pagina - 1) * limite;

  const [tipos, total] = await prisma.$transaction([
    prisma.tipoEquipamento.findMany({
      orderBy: { nome: "asc" },
      // include removido da listagem — desnecessário e pesado em listas grandes
      // usa ver() para o detalhe com equipamentos
      skip,
      take: limite,
    }),
    prisma.tipoEquipamento.count(),
  ]);

  return {
    sucesso: true,
    dados: tipos,
    meta: {
      total,
      pagina,
      limite,
      totalPaginas: Math.ceil(total / limite),
    },
  };
}

// ─── VER ──────────────────────────────────────────────────────────────────────

export async function ver(id: number) {
  const tipo = await prisma.tipoEquipamento.findUnique({
    where: { id },
    include: { equipamentos: true }, // detalhe inclui equipamentos
  });

  if (!tipo) throw new HttpError("Tipo de equipamento não encontrado.", 404);

  return { sucesso: true, dados: tipo };
}

// ─── EDITAR ───────────────────────────────────────────────────────────────────

export async function editar(
  id: number,
  data: { nome?: string; descricao?: string }
  // tipagem explícita em vez de `any`
) {
  // verifica existência antes de validar nome — 404 tem prioridade
  await buscarPorIdOuFalhar(id);

  const updateData: { nome?: string; descricao?: string | null } = {};

  if (data.nome !== undefined) {
    const nomeNormalizado = normalizarNome(data.nome);

    if (!nomeNormalizado) {
      throw new HttpError("O nome do tipo de equipamento não pode estar vazio.", 400);
    }

    // comparação case-insensitive
    const duplicado = await prisma.tipoEquipamento.findFirst({
      where: {
        nome: { equals: nomeNormalizado, mode: "insensitive" },
        NOT: { id },
      },
    });

    if (duplicado) {
      throw new HttpError("Já existe outro tipo de equipamento com este nome.", 409);
    }

    updateData.nome = nomeNormalizado;
  }

  if (data.descricao !== undefined) {
    updateData.descricao = data.descricao.trim() || null;
  }

  //  body vazio não deve fazer UPDATE desnecessário
  if (Object.keys(updateData).length === 0) {
    throw new HttpError("Nenhum campo válido para actualizar.", 400);
  }

  const atualizado = await prisma.tipoEquipamento.update({
    where: { id },
    data: updateData,
  });

  return { sucesso: true, dados: atualizado };
}

// ─── REMOVER ──────────────────────────────────────────────────────────────────

export async function remover(id: number) {
  await buscarPorIdOuFalhar(id);

  //  verifica equipamentos associados antes de apagar — evita erro de FK
  const equipamentosAssociados = await prisma.equipamento.count({
    where: { tipoEquipamentoId: id },
  });

  if (equipamentosAssociados > 0) {
    throw new HttpError(
      `Não é possível remover: existem ${equipamentosAssociados} equipamento(s) associado(s) a este tipo.`,
      409
    );
  }

  const eliminado = await prisma.tipoEquipamento.delete({ where: { id } });

  return { sucesso: true, dados: eliminado };
}