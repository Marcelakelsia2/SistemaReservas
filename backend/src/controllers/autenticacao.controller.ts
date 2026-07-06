import { NextFunction, Request, Response } from "express";
import * as authService from "../services/autenticacao.service";
import { AuthRequest } from "../middlewares/autenticar";

import {
  registarSchema,
  verificarEmailSchema,
  loginSchema,
  recuperarSenhaSchema,
  redefinirSenhaSchema,
} from "../validations/autenticacao.validacao";

import { formatZodError } from "../utils/handleZodError";
import { ZodError } from "zod";

// REGISTAR
export async function registar(req: Request, res: Response) {
  try {
    const body = registarSchema.parse(req.body);
    const usuario = await authService.registar(body);

    return res.status(201).json({
      mensagem: "Conta criada com sucesso.",
      usuario,
    });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        erro: true,
        mensagem: "Erro de validação",
        detalhes: formatZodError(error),
      });
    }
    return res.status(error.statusCode ?? 400).json({
      erro: true,
      mensagem: error.message,
    });
  }
}

// VERIFICAR EMAIL
export async function verificarEmail(req: Request, res: Response) {
  try {
    const body = verificarEmailSchema.parse(req.body);
    const resultado = await authService.verificarEmail(body.email, body.codigo);
    return res.json(resultado);
  } catch (error: any) {
    return res.status(error.statusCode ?? 400).json({
      erro: true,
      mensagem: error.message,
    });
  }
}

// REENVIAR CÓDIGO
export async function reenviarCodigo(req: Request, res: Response) {
  try {
    const { email } = req.body;
    const resultado = await authService.reenviarCodigo(email);
    return res.json(resultado);
  } catch (error: any) {
    return res.status(error.statusCode ?? 400).json({
      erro: true,
      mensagem: error.message,
    });
  }
}

// LOGIN
export async function login(req: Request, res: Response) {
  try {
    const body = loginSchema.parse(req.body);
    const resultado = await authService.login(body.email, body.senha);
    return res.json(resultado);
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        erro: true,
        mensagem: "Erro de validação",
        detalhes: formatZodError(error),
      });
    }
    return res.status(error.statusCode ?? 400).json({
      erro: true,
      mensagem: error.message,
    });
  }
}

// RECUPERAR SENHA
export async function recuperarSenha(req: Request, res: Response) {
  try {
    const body = recuperarSenhaSchema.parse(req.body);
    const resultado = await authService.recuperarSenha(body.email);
    return res.json(resultado);
  } catch (error: any) {
    return res.status(error.statusCode ?? 400).json({
      erro: true,
      mensagem: error.message,
    });
  }
}

// REDEFINIR SENHA
export async function redefinirSenha(req: Request, res: Response) {
  try {
    const body = redefinirSenhaSchema.parse(req.body);
    const resultado = await authService.redefinirSenha(
      body.email,
      body.codigo,
      body.novaSenha
    );
    return res.json(resultado);
  } catch (error: any) {
    return res.status(error.statusCode ?? 400).json({
      erro: true,
      mensagem: error.message,
    });
  }
}

// LOGOUT
// Usa AuthRequest para aceder a req.usuario sem cast — garantido pelo middleware autenticar
export async function logout(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const usuarioId = req.usuario!.id;
    const resultado = await authService.logout(usuarioId);
    return res.json(resultado);
  } catch (error) {
    next(error);
  }
}

// REFRESH TOKEN
export async function refreshToken(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ erro: true, mensagem: "Refresh token em falta." });
    }

    const resultado = await authService.refreshToken(refreshToken);
    return res.json(resultado);
  } catch (error) {
    next(error);
  }
}