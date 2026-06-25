import { Response } from "express";
import * as service from "../services/reserva.service";
import { AuthRequest } from "../middlewares/autenticar";
import { gerarComprovativoPDF } from "../utils/gerarComprovativo";

// CRIAR RESERVA
export async function criar(req: AuthRequest, res: Response) {
  const data = await service.criar(req.body, req.usuario!.id);
  return res.status(201).json({
    erro: false,
    dados: data,
  });
}

// LISTAR TODAS
export async function listar(req: AuthRequest, res: Response) {
  const data = await service.listar();

  return res.json({
    erro: false,
    dados: data,
  });
}

// MINHAS RESERVAS
export async function minhas(req: AuthRequest, res: Response) {
  const data = await service.minhas(req.usuario!.id);

  return res.json({
    erro: false,
    dados: data,
  });
}

// VER RESERVA
export async function ver(req: AuthRequest, res: Response) {
  const data = await service.ver(
    Number(req.params.id),
    req.usuario!
  );

  return res.json({
    erro: false,
    dados: data,
  });
}

// CANCELAR RESERVA
export async function cancelar(req: AuthRequest, res: Response) {
  const data = await service.cancelar(
    Number(req.params.id),
    req.usuario!,
    req.body.motivo
  );

  return res.json({
    erro: false,
    dados: data,
  });
}

// EDITAR RESERVA
export async function editar(req: AuthRequest, res: Response) {
  const data = await service.editar(
    Number(req.params.id),
    req.usuario!,
    req.body
  );

  return res.json({
    erro: false,
    dados: data,
  });
}

// DISPONIBILIDADE DA SALA
export async function disponibilidade(req: AuthRequest, res: Response) {
  const salaId = Number(req.params.salaId);
  const data = String(req.params.data);

  const resultado = await service.disponibilidade(salaId, data);

  return res.json({
    erro: false,
    dados: resultado,
  });
}

//COMPROVATIVO
export async function comprovativo(req: AuthRequest, res: Response) {
  const reserva = await service.comprovativo(
    Number(req.params.id),
    req.usuario!
  );
  gerarComprovativoPDF(reserva, res);
}