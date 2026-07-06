import { Request, Response, NextFunction } from "express";
import * as service from "../services/sala.service";

// ─── CRIAR SALA ───────────────────────────────────────────────────────────────

export async function criar(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const sala = await service.criar(req.body);
    return res.status(201).json({
      sucesso: true,
      mensagem: "Sala criada com sucesso",
      dados: sala,
    });
  } catch (err) {
    next(err);
  }
}

// ─── LISTAR SALAS ─────────────────────────────────────────────────────────────

export async function listar(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const salas = await service.listar();
    return res.status(200).json({
      sucesso: true,
      dados: salas,
    });
  } catch (err) {
    next(err);
  }
}

// ─── VER SALA ─────────────────────────────────────────────────────────────────

export async function ver(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);
    const sala = await service.ver(id);
    return res.status(200).json({
      sucesso: true,
      dados: sala,
    });
  } catch (err) {
    next(err);
  }
}

// ─── EDITAR SALA ──────────────────────────────────────────────────────────────

export async function editar(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);
    const sala = await service.editar(id, req.body);
    return res.status(200).json({
      sucesso: true,
      mensagem: "Sala actualizada com sucesso",
      dados: sala,
    });
  } catch (err) {
    next(err);
  }
}

// ─── ALTERAR DISPONIBILIDADE ──────────────────────────────────────────────────

export async function disponibilidade(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);
    const sala = await service.alterarDisponibilidade(id, req.body.estado);
    return res.status(200).json({
      sucesso: true,
      mensagem: "Estado actualizado com sucesso",
      dados: sala,
    });
  } catch (err) {
    next(err);
  }
}

// ─── REMOVER SALA ─────────────────────────────────────────────────────────────

export async function remover(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);
    await service.remover(id);
    return res.status(200).json({
      sucesso: true,
      mensagem: "Sala removida com sucesso",
    });
  } catch (err) {
    next(err);
  }
}

// ─── SALAS DISPONÍVEIS ────────────────────────────────────────────────────────

export async function disponiveis(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    //  query params ausentes chegam como undefined — String(undefined) === "undefined"
    // Por isso usamos o valor bruto e deixamos o service validar
    const salas = await service.disponiveis({
      data: req.query.data as string | undefined,
      horaInicio: req.query.horaInicio as string | undefined,
      horaFim: req.query.horaFim as string | undefined,
      capacidadeMinima: req.query.capacidadeMinima
        ? Number(req.query.capacidadeMinima)
        : undefined,
    });

    return res.status(200).json({
      sucesso: true,
      dados: salas,
    });
  } catch (err) {
    next(err);
  }
}