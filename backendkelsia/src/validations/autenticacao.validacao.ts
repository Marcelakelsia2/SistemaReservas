import { z } from "zod";

const senhaSchema = z
  .string()
  .min(8, "A senha deve ter pelo menos 8 caracteres")
  .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula")
  .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
  .regex(/[0-9]/, "A senha deve conter pelo menos um número")
  .regex(/[^A-Za-z0-9]/, "A senha deve conter pelo menos um símbolo");

// FIX: aceita formatos como +244 912 345 678 ou 912345678
// remove tudo excepto dígitos e valida que ficam entre 9 e 15
const telefoneSchema = z
  .string()
  .transform((val) => val.replace(/[\s()\-+]/g, ""))
  .pipe(
    z
      .string()
      .min(9, "O telefone deve ter pelo menos 9 dígitos")
      .max(15, "O telefone não pode ter mais de 15 dígitos")
      .regex(/^\d+$/, "O telefone deve conter apenas dígitos")
  );

export const registarSchema = z.object({
  nome: z
    .string()
    .min(1, "Nome é obrigatório")
    .refine(
      (val) => val.trim().split(/\s+/).filter(Boolean).length >= 2,
      "O nome deve conter pelo menos 2 palavras"
    ),

  email: z.string().email("Email inválido"),

  telefone: telefoneSchema,

  senha: senhaSchema,
});

export const verificarEmailSchema = z.object({
  email: z.string().email("Email inválido"),
  codigo: z
    .string()
    .length(6, "O código deve ter 6 dígitos")
    .regex(/^\d{6}$/, "O código deve conter apenas dígitos"),
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  senha: z.string().min(1, "Senha é obrigatória"),
});

export const recuperarSenhaSchema = z.object({
  email: z.string().email("Email inválido"),
});

export const redefinirSenhaSchema = z.object({
  email: z.string().email("Email inválido"),
  codigo: z
    .string()
    .length(6, "O código deve ter 6 dígitos")
    .regex(/^\d{6}$/, "O código deve conter apenas dígitos"),
  novaSenha: senhaSchema,
});