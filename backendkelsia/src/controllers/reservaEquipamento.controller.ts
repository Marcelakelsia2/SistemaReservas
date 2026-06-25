import { Request, Response, NextFunction } from "express";
import * as service from "../services/reservaEquipamento.service";

// ─── Tipo ─────────────────────────────────────────────────────────────────────

interface ReqComUsuario extends Request {
  usuario: { id: number; role: "ADMIN" | "FUNCIONARIO" | "USUARIO" };
}

// ─── CRIAR ────────────────────────────────────────────────────────────────────

export async function criar(req: Request, res: Response, next: NextFunction) {
  try {
    const reserva = await service.criar(
      req.body,
      (req as ReqComUsuario).usuario.id
    );
    return res.status(201).json({
      sucesso: true,
      mensagem: "Reserva criada com sucesso",
      dados: reserva,
    });
  } catch (err) {
    next(err);
  }
}

// ─── LISTAR ───────────────────────────────────────────────────────────────────

export async function listar(req: Request, res: Response, next: NextFunction) {
  try {
    const reservas = await service.listar();
    return res.status(200).json({
      sucesso: true,
      dados: reservas,
    });
  } catch (err) {
    next(err);
  }
}

// ─── MINHAS ───────────────────────────────────────────────────────────────────

export async function minhas(req: Request, res: Response, next: NextFunction) {
  try {
    const reservas = await service.minhas(
      (req as ReqComUsuario).usuario.id
    );
    return res.status(200).json({
      sucesso: true,
      dados: reservas,
    });
  } catch (err) {
    next(err);
  }
}

// ─── VER ──────────────────────────────────────────────────────────────────────

export async function ver(req: Request, res: Response, next: NextFunction) {
  try {
    const reserva = await service.ver(
      Number(req.params.id),
      (req as ReqComUsuario).usuario
    );
    return res.status(200).json({
      sucesso: true,
      dados: reserva,
    });
  } catch (err) {
    next(err);
  }
}

// ─── CANCELAR ─────────────────────────────────────────────────────────────────

export async function cancelar(req: Request, res: Response, next: NextFunction) {
  try {
    const reserva = await service.cancelar(
      Number(req.params.id),
      (req as ReqComUsuario).usuario,
      req.body.motivo
    );
    return res.status(200).json({
      sucesso: true,
      mensagem: "Reserva cancelada com sucesso",
      dados: reserva,
    });
  } catch (err) {
    next(err);
  }
}

// ─── EDITAR ───────────────────────────────────────────────────────────────────

export async function editar(req: Request, res: Response, next: NextFunction) {
  try {
    const reserva = await service.editar(
      Number(req.params.id),
      (req as ReqComUsuario).usuario,
      req.body
    );
    return res.status(200).json({
      sucesso: true,
      mensagem: "Reserva editada com sucesso",
      dados: reserva,
    });
  } catch (err) {
    next(err);
  }
}

// ─── DISPONIBILIDADE ──────────────────────────────────────────────────────────

export async function disponibilidade(req: Request, res: Response, next: NextFunction) {
  try {
    const resultado = await service.disponibilidade(
      Number(req.params.equipamentoId),
      req.query.data as string | undefined as any
    );
    return res.status(200).json({
      sucesso: true,
      dados: resultado,
    });
  } catch (err) {
    next(err);
  }
}

//COMPROVATIVO
import { gerarComprovatiyoEquipamentoPDF } from "../utils/gerarComprovativo";

export async function comprovativo(req: Request, res: Response, next: NextFunction) {
  try {
    const reserva = await service.comprovativo(
      Number(req.params.id),
      (req as ReqComUsuario).usuario
    );
    gerarComprovatiyoEquipamentoPDF(reserva, res);
  } catch (err) {
    next(err);
  }
}