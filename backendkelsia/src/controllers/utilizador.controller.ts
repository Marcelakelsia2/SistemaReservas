import { Request, Response } from "express";
import { ZodError } from "zod";

import * as utilizadoresService from "../services/utilizador.service";

import {
  atualizarPerfilSchema,
  alterarSenhaSchema,
  alterarRoleSchema,
  alterarEstadoSchema,
} from "../validations/utilizadores.validacao";

import { formatZodError } from "../utils/handleZodError";
import { AuthRequest } from "../middlewares/autenticar";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Extrai uma string simples de um query param do Express.
 * req.query devolve: string | ParsedQs | (string | ParsedQs)[] | undefined
 * Queremos apenas o primeiro valor primitivo ou "" como fallback.
 */
function queryToString(val: Request["query"][string]): string {
  if (typeof val === "string") return val;
  if (Array.isArray(val)) {
    const first = val[0];
    return typeof first === "string" ? first : "";
  }
  return "";
}

/** Valida e converte req.params.id para number.
 *  Aceita string | string[] para compatibilidade com todas as versões de @types/express.
 */
function parseId(param: string | string[], res: Response): number | null {
  const raw = Array.isArray(param) ? param[0] : param;
  const id = Number(raw);
  if (!raw || isNaN(id) || id <= 0) {
    res.status(400).json({ erro: true, mensagem: "ID inválido." });
    return null;
  }
  return id;
}

/** Lê e valida os query params de paginação (?pagina=1&limite=20). */
function parsePaginacao(query: Request["query"]) {
  const pagina = Math.max(1, Number(queryToString(query.pagina)) || 1);
  const limite = Math.min(100, Math.max(1, Number(queryToString(query.limite)) || 20));
  return { pagina, limite };
}

// ─── LISTAR UTILIZADORES ──────────────────────────────────────────────────────

export async function listarUtilizadores(req: Request, res: Response) {
  try {
    //  suporte a paginação via query params (?pagina=1&limite=20)
    const { pagina, limite } = parsePaginacao(req.query);

    const resultado = await utilizadoresService.listarUtilizadores({
      pagina,
      limite,
    });

    return res.json(resultado);
  } catch (error: any) {
    return res.status(error.statusCode ?? 500).json({
      erro: true,
      mensagem: error.message,
    });
  }
}

// ─── MEU PERFIL ───────────────────────────────────────────────────────────────

export async function meuPerfil(req: AuthRequest, res: Response) {
  try {
    const utilizador = await utilizadoresService.meuPerfil(req.usuario!.id);
    return res.json(utilizador);
  } catch (error: any) {
    return res.status(error.statusCode ?? 500).json({
      erro: true,
      mensagem: error.message,
    });
  }
}

// ─── VER UTILIZADOR (admin) ───────────────────────────────────────────────────

export async function verUtilizador(req: Request, res: Response) {
  try {
    const id = parseId(req.params.id, res);
    if (id === null) return;

    const utilizador = await utilizadoresService.verUtilizador(id);
    return res.json(utilizador);
  } catch (error: any) {
    return res.status(error.statusCode ?? 500).json({
      erro: true,
      mensagem: error.message,
    });
  }
}

// ─── EDITAR PERFIL ────────────────────────────────────────────────────────────

export async function atualizarPerfil(req: AuthRequest, res: Response) {
  try {
    const body = atualizarPerfilSchema.parse(req.body);

    const resultado = await utilizadoresService.atualizarPerfil(
      req.usuario!.id,
      body
    );

    return res.json({
      mensagem: "Perfil atualizado com sucesso.",
      ...resultado,
    });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        erro: true,
        mensagem: "Erro de validação",
        detalhes: formatZodError(error),
      });
    }
    return res.status(error.statusCode ?? 500).json({
      erro: true,
      mensagem: error.message,
    });
  }
}

// ─── ALTERAR PALAVRA-PASSE ────────────────────────────────────────────────────

export async function alterarPalavraPasse(req: AuthRequest, res: Response) {
  try {
    const body = alterarSenhaSchema.parse(req.body);

    const resultado = await utilizadoresService.alterarSenha(
      req.usuario!.id,
      body.senhaAtual,
      body.novaSenha
    );

    return res.json(resultado);
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        erro: true,
        mensagem: "Erro de validação",
        detalhes: formatZodError(error),
      });
    }
    return res.status(error.statusCode ?? 500).json({
      erro: true,
      mensagem: error.message,
    });
  }
}

// ─── ADMIN — ALTERAR ROLE ─────────────────────────────────────────────────────

export async function alterarTipoUtilizador(req: AuthRequest, res: Response) {
  try {
    const alvoId = parseId(req.params.id, res);
    if (alvoId === null) return;

    const body = alterarRoleSchema.parse(req.body);

    //  passa adminId para o serviço poder proteger auto-ação
    const utilizador = await utilizadoresService.alterarRole(
      req.usuario!.id,
      alvoId,
      body.role
    );

    return res.json({
      mensagem: "Tipo de utilizador alterado.",
      utilizador,
    });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        erro: true,
        mensagem: "Erro de validação",
        detalhes: formatZodError(error),
      });
    }
    return res.status(error.statusCode ?? 500).json({
      erro: true,
      mensagem: error.message,
    });
  }
}

// ─── ADMIN — BLOQUEAR / DESBLOQUEAR ──────────────────────────────────────────

export async function alterarEstado(req: AuthRequest, res: Response) {
  try {
    const alvoId = parseId(req.params.id, res);
    if (alvoId === null) return;

    const body = alterarEstadoSchema.parse(req.body);

    //  passa adminId para o serviço poder proteger auto-inativação
    const utilizador = await utilizadoresService.alterarEstado(
      req.usuario!.id,
      alvoId,
      body.ativo
    );

    return res.json({
      mensagem: "Estado alterado com sucesso.",
      utilizador,
    });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        erro: true,
        mensagem: "Erro de validação",
        detalhes: formatZodError(error),
      });
    }
    return res.status(error.statusCode ?? 500).json({
      erro: true,
      mensagem: error.message,
    });
  }
}

// ─── ADMIN — REMOVER UTILIZADOR ───────────────────────────────────────────────

export async function removerUtilizador(req: AuthRequest, res: Response) {
  try {
    const alvoId = parseId(req.params.id, res);
    if (alvoId === null) return;

    // passa adminId para o serviço poder proteger auto-remoção
    const resultado = await utilizadoresService.removerUtilizador(
      req.usuario!.id,
      alvoId
    );

    return res.json(resultado);
  } catch (error: any) {
    return res.status(error.statusCode ?? 500).json({
      erro: true,
      mensagem: error.message,
    });
  }
}