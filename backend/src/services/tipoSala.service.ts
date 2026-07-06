import { prisma } from "../lib/prisma";
import { HttpError } from "../utils/httpError";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Normaliza o nome antes de qualquer operação — trim + colapso de espaços internos. */
function normalizarNome(nome: string): string {
  return nome.trim().replace(/\s+/g, " ");
}

/** Busca um tipo de sala por ID ou lança 404. Reutilizado internamente. */
async function buscarPorIdOuFalhar(id: number) {
  const tipo = await prisma.tipoSala.findUnique({ where: { id } });

  if (!tipo) {
    throw new HttpError("Tipo de sala não encontrado.", 404);
  }

  return tipo;
}

// ─── CRIAR ────────────────────────────────────────────────────────────────────

export async function criar(nome: string, descricao?: string) {
  //  normaliza antes de comparar — evita duplicados por espaços ou capitalização
  const nomeNormalizado = normalizarNome(nome);

  if (!nomeNormalizado) {
    throw new HttpError("O nome do tipo de sala não pode estar vazio.", 400);
  }

  const existente = await prisma.tipoSala.findFirst({
    where: { nome: { equals: nomeNormalizado, mode: "insensitive" } },
  });

  if (existente) {
    throw new HttpError("Já existe um tipo de sala com esse nome.", 409);
  }

  //  normaliza a descrição também
  const descricaoNormalizada = descricao?.trim() || null;

  const tipo = await prisma.tipoSala.create({
    data: { nome: nomeNormalizado, descricao: descricaoNormalizada },
  });

  return { sucesso: true, dados: tipo };
}

// ─── LISTAR (com paginação) ───────────────────────────────────────────────────

export interface PaginacaoOpcoes {
  /** Página actual, base-1. Default: 1 */
  pagina?: number;
  /** Itens por página. Default: 20. Máximo: 100 */
  limite?: number;
}

export async function listar(opcoes: PaginacaoOpcoes = {}) {
  const pagina = Math.max(1, opcoes.pagina ?? 1);
  const limite = Math.min(100, Math.max(1, opcoes.limite ?? 20));
  const skip = (pagina - 1) * limite;

  const [tipos, total] = await prisma.$transaction([
    prisma.tipoSala.findMany({
      orderBy: { nome: "asc" }, //  ordem alfabética é mais útil que por id
      skip,
      take: limite,
    }),
    prisma.tipoSala.count(),
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

// ─── VER DETALHE ──────────────────────────────────────────────────────────────

export async function verPorId(id: number) {
  //  reutiliza helper — evita duplicação do findUnique + throw
  const tipo = await buscarPorIdOuFalhar(id);
  return { sucesso: true, dados: tipo };
}

// ─── EDITAR ───────────────────────────────────────────────────────────────────

export async function editar(
  id: number,
  data: { nome?: string; descricao?: string }
) {
  //  verifica existência antes de validar o nome — 404 tem prioridade
  await buscarPorIdOuFalhar(id);

  const updateData: { nome?: string; descricao?: string | null } = {};

  if (data.nome !== undefined) {
    const nomeNormalizado = normalizarNome(data.nome);

    if (!nomeNormalizado) {
      throw new HttpError("O nome do tipo de sala não pode estar vazio.", 400);
    }

    //  comparação case-insensitive — evita "Sala" e "sala" coexistirem
    const duplicado = await prisma.tipoSala.findFirst({
      where: {
        nome: { equals: nomeNormalizado, mode: "insensitive" },
        NOT: { id },
      },
    });

    if (duplicado) {
      throw new HttpError("Já existe outro tipo de sala com esse nome.", 409);
    }

    updateData.nome = nomeNormalizado;
  }

  if (data.descricao !== undefined) {
    //  permite apagar a descrição enviando string vazia
    updateData.descricao = data.descricao.trim() || null;
  }

  //  só actualiza se houver campos para mudar
  if (Object.keys(updateData).length === 0) {
    throw new HttpError("Nenhum campo válido para actualizar.", 400);
  }

  const atualizado = await prisma.tipoSala.update({
    where: { id },
    data: updateData,
  });

  return { sucesso: true, dados: atualizado };
}

// ─── REMOVER ──────────────────────────────────────────────────────────────────

export async function remover(id: number) {
  //  verifica existência antes de tentar apagar
  await buscarPorIdOuFalhar(id);

  // verifica se existem salas associadas — evita erro de FK na BD
  const salasAssociadas = await prisma.sala.count({
    where: { tipoSalaId: id },
  });

  if (salasAssociadas > 0) {
    throw new HttpError(
      `Não é possível remover: existem ${salasAssociadas} sala(s) associadas a este tipo.`,
      409
    );
  }

  const eliminado = await prisma.tipoSala.delete({ where: { id } });

  return { sucesso: true, dados: eliminado };
}