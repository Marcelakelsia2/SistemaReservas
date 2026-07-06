import bcrypt from "bcryptjs";

// Gera hash da palavra-passe
export async function encriptarSenha(senha: string): Promise<string> {
  return bcrypt.hash(senha, 10);
}

// Compara senha pura com hash guardado
export async function compararSenha(
  senha: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(senha, hash);
}