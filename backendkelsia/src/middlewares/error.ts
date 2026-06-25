import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { formatZodError } from "../utils/handleZodError";

export function errorMiddleware(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  //ERRO DE VALIDAÇÃO (ZOD)
  if (err instanceof ZodError) {
    return res.status(400).json({
      erro: true,
      mensagem: "Erro de validação",
      erros: formatZodError(err),
    });
  }

  // ERRO PERSONALIZADO
  const status = err.status || 500;

  return res.status(status).json({
    erro: true,
    mensagem: err.message || "Erro interno do servidor",
  });
}