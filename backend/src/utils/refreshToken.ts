import jwt from "jsonwebtoken";

const segredo = process.env.JWT_SECRET as string;

export function gerarRefreshToken(payload: object) {
  return jwt.sign(payload, segredo, { expiresIn: "7d" });
}

export function verificarRefreshToken(token: string) {
  return jwt.verify(token, segredo) as any;
}