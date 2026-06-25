import { z } from "zod";

export const atualizarPerfilSchema = z
  .object({
    nome: z
      .string()
      .min(5, "O nome deve ter pelo menos 2 palavras")
      .optional(),

    telefone: z
      .string()
      .regex(/^\d{9}$/, "O telefone deve ter 9 dígitos")
      .optional(),

    email: z
      .string()
      .email("Email inválido.")
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "É necessário fornecer pelo menos um campo para atualizar.",
  });

export const alterarSenhaSchema = z.object({
  senhaAtual: z.string().min(1, "A senha atual é obrigatória."),

  novaSenha: z
    .string()
    .min(8, "A nova senha deve ter pelo menos 8 caracteres.")
    .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula.")
    .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula.")
    .regex(/[0-9]/, "A senha deve conter pelo menos um número.")
    .regex(/[\W_]/, "A senha deve conter pelo menos um símbolo."),
});

// z.enum com "as const" e "error" em vez de "errorMap" (Zod v4)
export const alterarRoleSchema = z.object({
  role: z.enum(["ADMIN", "FUNCIONARIO", "USUARIO"] as const, {
    error: "Role inválido. Valores aceites: ADMIN, FUNCIONARIO, USUARIO.",
  }),
});

// "error" em vez de "errorMap" (Zod v4)
export const alterarEstadoSchema = z.object({
  ativo: z.boolean({
    error: "O campo ativo deve ser true ou false.",
  }),
});