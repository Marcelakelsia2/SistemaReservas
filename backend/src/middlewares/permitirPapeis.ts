import { Response, NextFunction } from "express";
import { AuthRequest } from "./autenticar";

export function permitirPapeis(
  ...papeisPermitidos: string[]
) {
  return (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {

    // Verifica autenticação
    if (!req.usuario) {
      return res.status(401).json({
        erro: true,
        mensagem: "Não autenticado.",
      });
    }

    // Verifica permissões
    if (
      !papeisPermitidos.includes(
        req.usuario.role
      )
    ) {
      return res.status(403).json({
        erro: true,
        mensagem: "Sem permissão.",
      });
    }

    next();
  };
}