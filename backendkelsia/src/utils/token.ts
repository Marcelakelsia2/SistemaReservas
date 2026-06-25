// Gera código numérico de 6 dígitos
import { randomInt } from "crypto";

export function gerarCodigo(): string {
  return randomInt(100000, 1000000).toString();
}