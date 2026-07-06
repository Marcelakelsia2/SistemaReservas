import { Request, Response } from "express";
import * as service from "../services/tipoEquipamento.service";
import { ZodError } from "zod";
import { formatZodError } from "../utils/handleZodError";
import { HttpError } from "../utils/httpError";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseId(param: string | string[], res: Response): number | null {
  const raw = Array.isArray(param) ? param[0] : param;
  const id = Number(raw);
  if (!raw || isNaN(id) || id <= 0) {
    res.status(400).json({ erro: true, mensagem: "ID inválido." });
    return null;
  }
  return id;
}

function parsePaginacao(query: Request["query"]) {
  const toStr = (v: Request["query"][string]) =>
    typeof v === "string" ? v : Array.isArray(v) && typeof v[0] === "string" ? v[0] : "";
  const pagina = Math.max(1, Number(toStr(query.pagina)) || 1);
  const limite = Math.min(100, Math.max(1, Number(toStr(query.limite)) || 20));
  return { pagina, limite };
}

function handleError(error: unknown, res: Response) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      erro: true,
      mensagem: "Erro de validação",
      detalhes: formatZodError(error),
    });
  }
  if (error instanceof HttpError) {
    return res.status(error.status).json({ erro: true, mensagem: error.message });
  }
  console.error(error);
  return res.status(500).json({ erro: true, mensagem: "Erro interno do servidor." });
}

// ─── CRIAR ────────────────────────────────────────────────────────────────────

export async function criar(req: Request, res: Response) {
  try {
    // extrai campos tipados em vez de passar req.body (any) directamente
    const { nome, descricao } = req.body;

    if (!nome || typeof nome !== "string") {
      return res.status(400).json({ erro: true, mensagem: "O campo 'nome' é obrigatório." });
    }

    const resultado = await service.criar(nome, descricao);

    return res.status(201).json({
      mensagem: "Tipo de equipamento criado com sucesso.",
      dados: resultado.dados,
    });
  } catch (error) {
    return handleError(error, res);
  }
}

// ─── LISTAR ───────────────────────────────────────────────────────────────────

export async function listar(req: Request, res: Response) {
  try {
    // sem try/catch no original — erros ficavam sem resposta
    const { pagina, limite } = parsePaginacao(req.query);
    const resultado = await service.listar({ pagina, limite });
    return res.json(resultado);
  } catch (error) {
    return handleError(error, res);
  }
}

// ─── VER ──────────────────────────────────────────────────────────────────────

export async function ver(req: Request, res: Response) {
  try {
    // sem try/catch e sem validação de ID no original
    const id = parseId(req.params.id, res);
    if (id === null) return;

    const resultado = await service.ver(id);
    return res.json(resultado);
  } catch (error) {
    return handleError(error, res);
  }
}

// ─── EDITAR ───────────────────────────────────────────────────────────────────

export async function editar(req: Request, res: Response) {
  try {
    // sem try/catch e sem validação de ID no original
    const id = parseId(req.params.id, res);
    if (id === null) return;

    const resultado = await service.editar(id, req.body);

    return res.json({
      mensagem: "Tipo de equipamento atualizado com sucesso.",
      dados: resultado.dados,
    });
  } catch (error) {
    return handleError(error, res);
  }
}

// ─── REMOVER ──────────────────────────────────────────────────────────────────

export async function remover(req: Request, res: Response) {
  try {
    // sem try/catch e sem validação de ID no original
    const id = parseId(req.params.id, res);
    if (id === null) return;

    const resultado = await service.remover(id);

    return res.json({
      mensagem: "Tipo de equipamento removido com sucesso.",
      dados: resultado.dados,
    });
  } catch (error) {
    return handleError(error, res);
  }
}