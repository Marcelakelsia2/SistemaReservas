import { prisma } from "../lib/prisma";
import { encriptarSenha, compararSenha } from "../utils/senha";
import { gerarToken, verificarToken, PayloadToken } from "../utils/jwt";
import { gerarCodigo } from "../utils/token";
import { enviarEmail } from "../utils/email";
import { HttpError } from "../utils/httpError";

// ─── REGISTAR ─────────────────────────────────────────────────────────────────

export async function registar(data: {
  nome: string;
  email: string;
  telefone: string;
  senha: string;
}) {
  data.nome = data.nome.trim();
  data.email = data.email.trim().toLowerCase();
  data.telefone = data.telefone.trim();

  if (data.nome.split(/\s+/).filter(Boolean).length < 2) {
    throw new HttpError("O nome deve conter pelo menos 2 palavras.", 400);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    throw new HttpError("Email inválido.", 400);
  }

  // FIX: limpar telefone antes de validar e guardar o valor limpo
  const telefoneLimpo = data.telefone.replace(/[\s()\-+]/g, "");
  if (!/^\d+$/.test(telefoneLimpo)) {
    throw new HttpError("Telefone inválido. Deve conter apenas dígitos.", 400);
  }
  if (telefoneLimpo.length < 9) {
    throw new HttpError("O telefone deve ter pelo menos 9 dígitos.", 400);
  }
  if (telefoneLimpo.length > 15) {
    throw new HttpError("O telefone não pode ter mais de 15 dígitos.", 400);
  }

  const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!senhaRegex.test(data.senha)) {
    throw new HttpError(
      "A senha deve ter pelo menos 8 caracteres, uma letra maiúscula, uma minúscula, um número e um símbolo.",
      400
    );
  }

  const [emailExiste, telefoneExiste] = await Promise.all([
    prisma.usuario.findUnique({ where: { email: data.email } }),
    prisma.usuario.findUnique({ where: { telefone: telefoneLimpo } }),
  ]);

  if (emailExiste) {
    throw new HttpError("Email já cadastrado.", 409);
  }
  if (telefoneExiste) {
    throw new HttpError("Telefone já utilizado.", 409);
  }

  const senhaHash = await encriptarSenha(data.senha);
  const codigo = gerarCodigo();
  const expira = new Date(Date.now() + 15 * 60 * 1000);

  const usuario = await prisma.usuario.create({
    data: {
      nome: data.nome,
      email: data.email,
      telefone: telefoneLimpo, // FIX: guardar o valor limpo, não o original
      senha: senhaHash,
      codigoVerificacao: codigo,
      codigoExpiraEm: expira,
    },
  });

  await enviarEmail(
    usuario.email,
    "Verificação de Conta",
    `O seu código de verificação é: ${codigo}`
  );

  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
  };
}

// ─── VERIFICAR EMAIL ──────────────────────────────────────────────────────────

export async function verificarEmail(email: string, codigo: string) {
  // FIX: validar formato do código antes de ir à base de dados
  if (!codigo || !/^\d{6}$/.test(codigo)) {
    throw new HttpError("Código inválido. Deve conter exactamente 6 dígitos numéricos.", 400);
  }

  const usuario = await prisma.usuario.findUnique({ where: { email } });

  if (!usuario) throw new HttpError("Utilizador não encontrado.", 404);
  if (!usuario.ativo) throw new HttpError("Conta desativada.", 403);
  if (usuario.emailVerificado) throw new HttpError("Este email já foi verificado.", 400);
  if (!usuario.codigoVerificacao) throw new HttpError("Nenhum código de verificação pendente.", 400);
  if (usuario.codigoVerificacao !== codigo) throw new HttpError("Código incorreto.", 400);
  if (usuario.codigoExpiraEm && usuario.codigoExpiraEm < new Date()) {
    throw new HttpError("Código expirado.", 400);
  }

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { emailVerificado: true, codigoVerificacao: null, codigoExpiraEm: null },
  });

  return { mensagem: "Email verificado com sucesso." };
}

// ─── REENVIAR CÓDIGO ──────────────────────────────────────────────────────────

export async function reenviarCodigo(email: string) {
  const usuario = await prisma.usuario.findUnique({ where: { email } });

  if (!usuario) throw new HttpError("Utilizador não encontrado.", 404);
  if (!usuario.ativo) throw new HttpError("Conta desativada.", 403);
  if (usuario.emailVerificado) throw new HttpError("O email já foi verificado.", 400);

  const codigo = gerarCodigo();

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: {
      codigoVerificacao: codigo,
      codigoExpiraEm: new Date(Date.now() + 15 * 60 * 1000),
    },
  });

  await enviarEmail(usuario.email, "Novo Código", `O seu novo código é: ${codigo}`);

  return { mensagem: "Novo código enviado." };
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────

export async function login(email: string, senha: string) {
  email = email.trim().toLowerCase();

  const usuario = await prisma.usuario.findUnique({ where: { email } });

  if (!usuario) throw new HttpError("Credenciais inválidas.", 401);
  if (!usuario.ativo) throw new HttpError("Conta desativada.", 403);
  if (!usuario.emailVerificado) throw new HttpError("Email não verificado.", 400);

  const senhaValida = await compararSenha(senha, usuario.senha);
  if (!senhaValida) throw new HttpError("Credenciais inválidas.", 401);

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

// ─── RECUPERAR SENHA ──────────────────────────────────────────────────────────

export async function recuperarSenha(email: string) {
  const usuario = await prisma.usuario.findUnique({ where: { email } });

  if (!usuario) throw new HttpError("Utilizador não encontrado.", 404);
  if (!usuario.ativo) throw new HttpError("Conta desativada.", 403);

  const codigo = gerarCodigo();

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: {
      codigoRecuperacao: codigo,
      codigoRecuperacaoExpiraEm: new Date(Date.now() + 15 * 60 * 1000),
    },
  });

  await enviarEmail(
    usuario.email,
    "Recuperação de Palavra-passe",
    `O seu código de recuperação é: ${codigo}`
  );

  return { mensagem: "Código enviado para o email." };
}

// ─── REDEFINIR SENHA ──────────────────────────────────────────────────────────

export async function redefinirSenha(email: string, codigo: string, novaSenha: string) {
  // FIX: validar formato do código antes de ir à base de dados
  if (!codigo || !/^\d{6}$/.test(codigo)) {
    throw new HttpError("Código inválido. Deve conter exactamente 6 dígitos numéricos.", 400);
  }

  const usuario = await prisma.usuario.findUnique({ where: { email } });

  if (!usuario) throw new HttpError("Utilizador não encontrado.", 404);

  if (!usuario.codigoRecuperacao) {
    throw new HttpError("Nenhum pedido de recuperação pendente.", 400);
  }
  if (usuario.codigoRecuperacao !== codigo) {
    throw new HttpError("Código inválido.", 400);
  }
  if (
    usuario.codigoRecuperacaoExpiraEm &&
    usuario.codigoRecuperacaoExpiraEm < new Date()
  ) {
    throw new HttpError("Código expirado.", 400);
  }

  const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!senhaRegex.test(novaSenha)) {
    throw new HttpError(
      "A nova senha deve ter pelo menos 8 caracteres, uma letra maiúscula, uma minúscula, um número e um símbolo.",
      400
    );
  }

  // FIX: só comparar com a senha actual se ela existir (contas OAuth têm senha vazia)
  if (usuario.senha) {
    const senhaIgual = await compararSenha(novaSenha, usuario.senha);
    if (senhaIgual) {
      throw new HttpError("A nova senha deve ser diferente da senha actual.", 400);
    }
  }

  const senhaHash = await encriptarSenha(novaSenha);

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: {
      senha: senhaHash,
      codigoRecuperacao: null,
      codigoRecuperacaoExpiraEm: null,
    },
  });

  return { mensagem: "Palavra-passe redefinida com sucesso." };
}

// ─── LOGOUT ───────────────────────────────────────────────────────────────────

export async function logout(usuarioId: number) {
  await prisma.usuario.update({
    where: { id: usuarioId },
    data: { refreshToken: null },
  });

  return { mensagem: "Sessão terminada com sucesso." };
}

// ─── REFRESH TOKEN ────────────────────────────────────────────────────────────

export async function refreshToken(token: string) {
  try {
    const payload = verificarToken(token) as PayloadToken;

    if (payload.type !== "refresh") {
      throw new HttpError("Token inválido.", 401);
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: payload.id },
    });

    if (!usuario || usuario.refreshToken !== token) {
      throw new HttpError("Refresh token inválido ou revogado.", 401);
    }

    if (!usuario.ativo) {
      throw new HttpError("Conta desativada.", 403);
    }

    const novoToken = gerarToken({ id: payload.id, role: payload.role }, "15m");
    const novoRefreshToken = gerarToken(
      { id: payload.id, role: payload.role, type: "refresh" },
      "7d"
    );

    await prisma.usuario.update({
      where: { id: payload.id },
      data: { refreshToken: novoRefreshToken },
    });

    return { token: novoToken, refreshToken: novoRefreshToken };
  } catch (err) {
    if (err instanceof HttpError) throw err;
    throw new HttpError("Refresh token inválido ou expirado.", 401);
  }
}