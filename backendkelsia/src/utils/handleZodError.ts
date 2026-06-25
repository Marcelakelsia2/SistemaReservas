import { ZodError } from "zod";

export function formatZodError(error: ZodError) {
  return error.issues.map((err) => ({
    campo: err.path.join("."),
    mensagem: err.message,
  }));
}