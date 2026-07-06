import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { HttpError } from "../utils/httpError";

const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
const telefoneRegex = /^\d{9}$/;

/** Campos públicos partilhados por várias queries — evita repetição. */
const selectPublico = {
  id: true,
  nome: true,
  email: true,
  telefone: true,
  role: true,
  ativo: true,
  emailVerificado: true,
  dataCriacao: true,
} as const;

async function buscarUtilizadorPorId(id: number) {
  const usuario = await prisma.usuario.findUnique({
    where: { id },
    select: selectPublico,
  });

  if (!usuario) {
    throw new HttpError("Utilizador não encontrado.", 404);
  }

  return usuario;
}

/**
 * Garante que um admin não executa ações destrutivas/bloqueantes sobre
 * si próprio (inativar, remover, alterar o próprio role por esta via).
 */
function protegerAutoAcao(adminId: number, alvoId: number, acao: string) {
  if (adminId === alvoId) {
    throw new HttpError(
      `Não é permitido ${acao} a sua própria conta.`,
      403
    );
  }
}

// ─── Listar utilizadores (com paginação) ──────────────────────────────────────

export interface PaginacaoOpcoes {
  pagina?: number;   // base-1, default: 1
  limite?: number;   // itens por página, default: 20, máx: 100
}

export async function listarUtilizadores(opcoes: PaginacaoOpcoes = {}) {
  const pagina = Math.max(1, opcoes.pagina ?? 1);
  const limite = Math.min(100, Math.max(1, opcoes.limite ?? 20));
  const skip = (pagina - 1) * limite;

  const [utilizadores, total] = await prisma.$transaction([
    prisma.usuario.findMany({
      where: { deletadoEm: null },
      select: selectPublico,
      orderBy: { dataCriacao: "desc" },
      skip,
      take: limite,
    }),
    prisma.usuario.count({ where: { deletadoEm: null } }),
  ]);

  return {
    dados: utilizadores,
    meta: {
      total,
      pagina,
      limite,
      totalPaginas: Math.ceil(total / limite),
    },
  };
}

// ─── Meu perfil ───────────────────────────────────────────────────────────────

export async function meuPerfil(id: number) {
  return buscarUtilizadorPorId(id);
}

// ─── Ver utilizador (admin) ───────────────────────────────────────────────────

export async function verUtilizador(id: number) {
  return buscarUtilizadorPorId(id);
}

// ─── Editar perfil ────────────────────────────────────────────────────────────

export async function atualizarPerfil(
  id: number,
  data: { nome?: string; telefone?: string }
) {
  if (data.nome !== undefined) {
    data.nome = data.nome.trim();
    if (data.nome.split(/\s+/).filter(Boolean).length < 2) {
      throw new HttpError("O nome deve conter pelo menos 2 palavras.", 400);
    }
  }

  if (data.telefone !== undefined) {
    data.telefone = data.telefone.trim();

    const telefoneLimpo = data.telefone.replace(/[\s()\-+]/g, "");
      if (!/^\d+$/.test(telefoneLimpo)) {
        throw new HttpError("Telefone inválido.", 400);
      }
      if (telefoneLimpo.length > 9) {
        throw new HttpError("O telefone não pode ter mais de 9 dígitos.", 400);
      }
    }
      return prisma.usuario.update({
    where: { id },
    data,
    select: selectPublico,
  });
}

// ─── Alterar senha ────────────────────────────────────────────────────────────

export async function alterarSenha(
  id: number,
  senhaAtual: string,
  novaSenha: string
) {
  const usuario = await prisma.usuario.findUnique({ where: { id } });

  if (!usuario) {
    throw new HttpError("Utilizador não encontrado.", 404);
  }

  const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha);
  if (!senhaValida) {
    throw new HttpError("Senha atual incorreta.", 400);
  }

  if (!senhaRegex.test(novaSenha)) {
    throw new HttpError(
      "A nova senha deve ter pelo menos 8 caracteres, uma letra maiúscula, uma minúscula, um número e um símbolo.",
      400
    );
  }

  const senhaIgual = await bcrypt.compare(novaSenha, usuario.senha);
  if (senhaIgual) {
    throw new HttpError("A nova senha deve ser diferente da senha atual.", 400);
  }

  const hash = await bcrypt.hash(novaSenha, 10);

  await prisma.usuario.update({
    where: { id },
    data: { senha: hash },
  });

  return { mensagem: "Palavra-passe alterada com sucesso." };
}

// ─── Alterar role (admin) ─────────────────────────────────────────────────────

export async function alterarRole(
  adminId: number,
  alvoId: number,
  role: Role
) {
  //  admin não pode alterar o próprio role por esta via
  protegerAutoAcao(adminId, alvoId, "alterar o role de");

  const usuario = await prisma.usuario.findUnique({ where: { id: alvoId } });

  if (!usuario) {
    throw new HttpError("Utilizador não encontrado.", 404);
  }

  return prisma.usuario.update({
    where: { id: alvoId },
    data: { role },
    select: {
      id: true,
      nome: true,
      email: true,
      role: true,
    },
  });
}

// ─── Bloquear / Desbloquear (admin) ──────────────────────────────────────────

export async function alterarEstado(
  adminId: number,
  alvoId: number,
  ativo: boolean
) {
  //  admin não pode inativar a sua própria conta
  if (!ativo) {
    protegerAutoAcao(adminId, alvoId, "inativar");
  }

  const usuario = await prisma.usuario.findUnique({ where: { id: alvoId } });

  if (!usuario) {
    throw new HttpError("Utilizador não encontrado.", 404);
  }

  return prisma.usuario.update({
    where: { id: alvoId },
    data: { ativo },
    select: {
      id: true,
      nome: true,
      email: true,
      ativo: true,
    },
  });
}

// ─── Remover utilizador — SOFT DELETE (admin) ─────────────────────────────────

export async function removerUtilizador(adminId: number, alvoId: number) {
  //  admin não pode remover a sua própria conta
  protegerAutoAcao(adminId, alvoId, "remover");

  const usuario = await prisma.usuario.findUnique({
    where: { id: alvoId },
  });

  if (!usuario) {
    throw new HttpError("Utilizador não encontrado.", 404);
  }

  //soft delete — preserva o registo na BD com timestamp
  if (usuario.deletadoEm) {
    throw new HttpError("Utilizador já foi removido.", 409);
  }

  await prisma.usuario.update({
    where: { id: alvoId },
    data: {
      ativo: false,
      deletadoEm: new Date(),
    },
  });

  return { mensagem: "Utilizador removido com sucesso." };
}