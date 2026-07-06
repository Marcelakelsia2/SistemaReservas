import { Request, Response, NextFunction } from "express";
import * as service from "../services/equipamento.service";

// ─── CRIAR ────────────────────────────────────────────────────────────────────

export async function criar(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const equipamento = await service.criar(req.body);
    return res.status(201).json({
      sucesso: true,
      mensagem: "Equipamento criado com sucesso",
      dados: equipamento,
    });
  } catch (err) {
    next(err);
  }
}

// ─── LISTAR ───────────────────────────────────────────────────────────────────

export async function listar(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const equipamentos = await service.listar();
    return res.status(200).json({
      sucesso: true,
      dados: equipamentos,
    });
  } catch (err) {
    next(err);
  }
}

// ─── VER ──────────────────────────────────────────────────────────────────────

export async function ver(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const equipamento = await service.ver(Number(req.params.id));
    return res.status(200).json({
      sucesso: true,
      dados: equipamento,
    });
  } catch (err) {
    next(err);
  }
}

// ─── EDITAR ───────────────────────────────────────────────────────────────────

export async function editar(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const equipamento = await service.editar(Number(req.params.id), req.body);
    return res.status(200).json({
      sucesso: true,
      mensagem: "Equipamento actualizado com sucesso",
      dados: equipamento,
    });
  } catch (err) {
    next(err);
  }
}

// ─── DISPONIBILIDADE ──────────────────────────────────────────────────────────

export async function disponibilidade(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const equipamento = await service.alterarDisponibilidade(
      Number(req.params.id),
      req.body.estado
    );
    return res.status(200).json({
      sucesso: true,
      mensagem: "Estado actualizado com sucesso",
      dados: equipamento,
    });
  } catch (err) {
    next(err);
  }
}

// ─── QUANTIDADE ───────────────────────────────────────────────────────────────

export async function quantidade(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const quantidadeTotal = Number(req.body.quantidadeTotal);
    if (!Number.isFinite(quantidadeTotal)) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "quantidadeTotal deve ser um número válido",
      });
    }
    const equipamento = await service.alterarQuantidade(
      Number(req.params.id),
      quantidadeTotal
    );
    return res.status(200).json({
      sucesso: true,
      mensagem: "Quantidade actualizada com sucesso",
      dados: equipamento,
    });
  } catch (err) {
    next(err);
  }
}

// ─── DISPONÍVEIS ──────────────────────────────────────────────────────────────

export async function disponiveis(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const equipamentos = await service.disponiveis();
    return res.status(200).json({
      sucesso: true,
      dados: equipamentos,
    });
  } catch (err) {
    next(err);
  }
}

// ─── REMOVER ──────────────────────────────────────────────────────────────────

export async function remover(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await service.remover(Number(req.params.id));
    return res.status(200).json({
      sucesso: true,
      mensagem: "Equipamento removido com sucesso",
    });
  } catch (err) {
    next(err);
  }
}