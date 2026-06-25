import { prisma } from "../lib/prisma";
import { gerarToken } from "../utils/jwt";
import { HttpError } from "../utils/httpError";

interface UsuarioPrisma {
  id: number;
  role: "ADMIN" | "FUNCIONARIO" | "USUARIO";
  ativo: boolean;
  nome: string;
  email: string;
}

// Chamado após o Passport validar o utilizador com sucesso.
// Gera os tokens JWT próprios do sistema e guarda o refreshToken.
export async function finalizarLoginOAuth(usuario: UsuarioPrisma) {
  if (!usuario.ativo) {
    throw new HttpError("Conta desativada.", 403);
  }

  const token = gerarToken({ id: usuario.id, role: usuario.role }, "15m");
  const novoRefreshToken = gerarToken(
    { id: usuario.id, role: usuario.role, type: "refresh" },
    "7d"
  );

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { refreshToken: novoRefreshToken },
  });

  return {
    token,
    refreshToken: novoRefreshToken,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role,
    },
  };
}