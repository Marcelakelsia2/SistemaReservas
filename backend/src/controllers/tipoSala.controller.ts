import { Request, Response } from "express";
import * as service from "../services/tipoSala.service";
import { ZodError } from "zod";
import { formatZodError } from "../utils/handleZodError";
import { HttpError } from "../utils/httpError";

// ─── Helper ───────────────────────────────────────────────────────────────────

/** Valida e converte req.params.id para number. Responde 400 e devolve null se inválido. */
function parseId(param: string | string[], res: Response): number | null {
  const raw = Array.isArray(param) ? param[0] : param;
  const id = Number(raw);
  if (!raw || isNaN(id) || id <= 0) {
    res.status(400).json({ erro: true, mensagem: "ID inválido." });
    return null;
  }
  return id;
}

/** Extrai paginação de req.query de forma segura (ParsedQs → number). */
function parsePaginacao(query: Request["query"]) {
  const toStr = (v: Request["query"][string]) =>
    typeof v === "string" ? v : Array.isArray(v) && typeof v[0] === "string" ? v[0] : "";

  const pagina = Math.max(1, Number(toStr(query.pagina)) || 1);
  const limite = Math.min(100, Math.max(1, Number(toStr(query.limite)) || 20));
  return { pagina, limite };
}

/** Tratamento de erros centralizado — evita repetir o mesmo bloco catch em cada função. */
function handleError(error: unknown, res: Response) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      erro: true,
      mensagem: "Erro de validação",
      detalhes: formatZodError(error),
    });
  }
  if (error instanceof HttpError) {
    return res.status(error.status).json({
      erro: true,
      mensagem: error.message,
    });
  }
  console.error(error); // log server-side para erros inesperados
  return res.status(500).json({
    erro: true,
    mensagem: "Erro interno do servidor.",
  });
}

// ─── CRIAR ────────────────────────────────────────────────────────────────────

export async function criar(req: Request, res: Response) {
  try {
    const { nome, descricao } = req.body;

    // validação básica no controller — o serviço também valida, mas
    // falhar cedo evita chamadas desnecessárias à BD
    if (!nome || typeof nome !== "string") {
      return res.status(400).json({ erro: true, mensagem: "O campo 'nome' é obrigatório." });
    }

    const resultado = await service.criar(nome, descricao);

    return res.status(201).json({
      mensagem: "Tipo de sala criado com sucesso.",
      dados: resultado.dados, // consistência — usa "dados" em vez de "data"
    });
  } catch (error) {
    return handleError(error, res);
  }
}

// ─── LISTAR ───────────────────────────────────────────────────────────────────

export async function listar(req: Request, res: Response) {
  try {
    // listar estava sem try/catch — erros de BD ficavam sem resposta
    //  suporte a paginação via query params
    const { pagina, limite } = parsePaginacao(req.query);
    const resultado = await service.listar({ pagina, limite });

    return res.json(resultado); // envelope { sucesso, dados, meta } já vem do serviço
  } catch (error) {
    return handleError(error, res);
  }
}

// ─── VER POR ID ───────────────────────────────────────────────────────────────

export async function ver(req: Request, res: Response) {
  try {
    //  ver estava sem try/catch e sem validação de ID
    const id = parseId(req.params.id, res);
    if (id === null) return;

    const resultado = await service.verPorId(id);
    return res.json(resultado);
  } catch (error) {
    return handleError(error, res);
  }
}

// ─── EDITAR ───────────────────────────────────────────────────────────────────

export async function editar(req: Request, res: Response) {
  try {
    //  usava Number() directamente sem validar — ID inválido chegava ao serviço
    const id = parseId(req.params.id, res);
    if (id === null) return;

    const resultado = await service.editar(id, req.body);

    return res.json({
      mensagem: "Tipo de sala atualizado com sucesso.",
      dados: resultado.dados,
    });
  } catch (error) {
    return handleError(error, res);
  }
}

// ─── REMOVER ──────────────────────────────────────────────────────────────────

export async function remover(req: Request, res: Response) {
  try {
    //  usava Number() directamente sem validar
    const id = parseId(req.params.id, res);
    if (id === null) return;

    const resultado = await service.remover(id);

    return res.json({
      mensagem: "Tipo de sala removido com sucesso.",
      dados: resultado.dados,
    });
  } catch (error) {
    return handleError(error, res);
  }
}