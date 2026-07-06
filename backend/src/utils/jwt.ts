import jwt, { SignOptions } from "jsonwebtoken";
import { Role } from "@prisma/client";

export interface PayloadToken {
  id: number;
  role: Role;
  type?: string;
}

const segredo = process.env.JWT_SECRET as string;

// Gera token JWT
export function gerarToken(payload: object, expiresIn: string = "15m"): string {
  const options: SignOptions = { expiresIn: expiresIn as SignOptions["expiresIn"] };
  return jwt.sign(payload, segredo, options);
}

// Verifica token JWT
export function verificarToken(token: string): PayloadToken {
  return jwt.verify(token, segredo) as PayloadToken;
}