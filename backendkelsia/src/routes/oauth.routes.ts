import { Router } from "express";
import { iniciarGoogle, callbackGoogle } from "../controllers/oauth.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: OAuth
 *   description: Autenticação via Google OAuth 2.0
 */

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Iniciar login com Google
 *     tags: [OAuth]
 *     description: Redireciona o utilizador para a página de autenticação do Google.
 *     responses:
 *       302:
 *         description: Redireccionamento para o Google
 */
router.get("/google", iniciarGoogle);

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Callback do Google OAuth
 *     tags: [OAuth]
 *     description: |
 *       Endpoint chamado pelo Google após autenticação.
 *       Em caso de sucesso, redireciona para o frontend com `token` e `refreshToken` na query string.
 *       Em caso de falha, redireciona para `/login?erro=...`.
 *     responses:
 *       302:
 *         description: Redireccionamento para o frontend
 */
router.get("/google/callback", callbackGoogle);

export default router;