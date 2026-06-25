import { Request, Response, NextFunction } from "express";
import passport from "../config/passport";
import * as oauthService from "../services/oauth.service";

//INICIAR FLUXO GOOGLE
// GET /api/auth/google
// Redireciona o utilizador para a página de login do Google.

export const iniciarGoogle = passport.authenticate("google", {
  scope: ["profile", "email"],
  session: false,
});


export async function callbackGoogle(
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log("FRONTEND_URL:", process.env.FRONTEND_URL); 

  // Primeiro o Passport processa o callback
  passport.authenticate(
    "google",
    { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?erro=oauth` },
    async (err: Error | null, usuario: any) => {
      try {
        if (err || !usuario) {
          const mensagem = err?.message ?? "Autenticação falhada.";
          return res.redirect(
            `${process.env.FRONTEND_URL}/login?erro=${encodeURIComponent(mensagem)}`
          );
        }

        const resultado = await oauthService.finalizarLoginOAuth(usuario);

        // Redireciona para o frontend com os tokens na query string.
        // para evitar exposição do token no histórico do browser.
        const params = new URLSearchParams({
          token: resultado.token,
          refreshToken: resultado.refreshToken,
        });

        return res.redirect(
          `${process.env.FRONTEND_URL}/oauth/sucesso?${params.toString()}`
        );
      } catch (error) {
        next(error);
      }
    }
  )(req, res, next);
}