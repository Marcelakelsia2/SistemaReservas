import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";

interface TokenPayload {
  id: number;
  role: Role;
}

export interface AuthRequest extends Request {
  usuario?: TokenPayload;
}

export function autenticar(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        erro: true,
        mensagem: "Token não fornecido.",
      });
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2) {
      return res.status(401).json({
        erro: true,
        mensagem: "Formato do token inválido.",
      });
    }

    const token = parts[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as TokenPayload;

    req.usuario = decoded;

    next();
  } catch (error: any) {
    return res.status(401).json({
      erro: true,
      mensagem: "Token inválido ou expirado.",
    });
  }
}