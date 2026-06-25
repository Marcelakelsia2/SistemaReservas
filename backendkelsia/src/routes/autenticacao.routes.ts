import { Router } from "express";
import {
  registar,
  verificarEmail,
  reenviarCodigo,
  login,
  recuperarSenha,
  redefinirSenha,
  logout,
  refreshToken,
} from "../controllers/autenticacao.controller";
import { autenticar } from "../middlewares/autenticar";

const router = Router();

/* =============================================================
   REGISTAR
   ============================================================= */
/**
 * @swagger
 * /api/autenticacao/registar:
 *   post:
 *     summary: Criar nova conta
 *     description: |
 *       Cria uma nova conta de utilizador e envia um **código de verificação** para o email indicado.
 *
 *       ### Regras da senha
 *       - Mínimo 8 caracteres
 *       - Pelo menos uma letra maiúscula
 *       - Pelo menos uma letra minúscula
 *       - Pelo menos um número
 *       - Pelo menos um símbolo (ex: `@`, `#`, `!`)
 *
 *       ### Após o registo
 *       O utilizador deve verificar o email antes de poder fazer login.
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegistarInput'
 *           examples:
 *             exemplo:
 *               summary: Exemplo de registo
 *               value:
 *                 nome: "João Silva"
 *                 email: "joao@email.com"
 *                 telefone: "+244912345678"
 *                 senha: "Senha@123"
 *     responses:
 *       201:
 *         description: Conta criada com sucesso. Um código foi enviado para o email.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegistarResponse'
 *       400:
 *         description: Dados inválidos ou email/telefone já utilizados.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroValidacao'
 *             examples:
 *               emailExistente:
 *                 summary: Email já utilizado
 *                 value:
 *                   erro: true
 *                   mensagem: "Email já utilizado."
 *               senhaFraca:
 *                 summary: Senha não cumpre os requisitos
 *                 value:
 *                   erro: true
 *                   mensagem: "A senha deve ter pelo menos 8 caracteres, uma letra maiúscula, uma minúscula, um número e um símbolo."
 */
router.post("/registar", registar);

/* =============================================================
   VERIFICAR EMAIL
   ============================================================= */
/**
 * @swagger
 * /api/autenticacao/verificar-email:
 *   post:
 *     summary: Verificar email com código
 *     description: |
 *       Verifica o email do utilizador com o código de 6 dígitos enviado após o registo.
 *
 *       O código expira ao fim de **15 minutos**. Usa `/reenviar-codigo` para obter um novo.
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerificarEmailInput'
 *           examples:
 *             exemplo:
 *               summary: Exemplo
 *               value:
 *                 email: "joao@email.com"
 *                 codigo: "483921"
 *     responses:
 *       200:
 *         description: Email verificado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MensagemResponse'
 *             example:
 *               mensagem: "Email verificado com sucesso."
 *       400:
 *         description: Código inválido, expirado ou email já verificado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *             examples:
 *               codigoErrado:
 *                 summary: Código incorreto
 *                 value:
 *                   erro: true
 *                   mensagem: "Código incorreto."
 *               codigoExpirado:
 *                 summary: Código expirado
 *                 value:
 *                   erro: true
 *                   mensagem: "Código expirado."
 *               jaVerificado:
 *                 summary: Email já verificado
 *                 value:
 *                   erro: true
 *                   mensagem: "Este email já foi verificado."
 *       404:
 *         description: Utilizador não encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.post("/verificar-email", verificarEmail);

/* =============================================================
   REENVIAR CÓDIGO
   ============================================================= */
/**
 * @swagger
 * /api/autenticacao/reenviar-codigo:
 *   post:
 *     summary: Reenviar código de verificação
 *     description: |
 *       Gera um novo código de verificação e envia-o para o email indicado.
 *
 *       Só funciona se o email **ainda não estiver verificado**.
 *       O novo código expira ao fim de **15 minutos**.
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReenviarCodigoInput'
 *           examples:
 *             exemplo:
 *               summary: Exemplo
 *               value:
 *                 email: "joao@email.com"
 *     responses:
 *       200:
 *         description: Novo código enviado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MensagemResponse'
 *             example:
 *               mensagem: "Novo código enviado."
 *       400:
 *         description: Email já verificado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       404:
 *         description: Utilizador não encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.post("/reenviar-codigo", reenviarCodigo);

/* =============================================================
   LOGIN
   ============================================================= */
/**
 * @swagger
 * /api/autenticacao/iniciar-sessao:
 *   post:
 *     summary: Iniciar sessão
 *     description: |
 *       Autentica o utilizador e devolve dois tokens:
 *
 *       | Token | Validade | Uso |
 *       |-------|----------|-----|
 *       | `token` | 15 minutos | Enviar no header `Authorization: Bearer <token>` |
 *       | `refreshToken` | 7 dias | Usar em `/refresh-token` para obter novo access token |
 *
 *       ### ⚠️ Pré-requisitos
 *       - Email verificado
 *       - Conta ativa
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *           examples:
 *             utilizadorNormal:
 *               summary: Utilizador normal
 *               value:
 *                 email: "joao@email.com"
 *                 senha: "Senha@123"
 *             admin:
 *               summary: Administrador
 *               value:
 *                 email: "admin@email.com"
 *                 senha: "Admin@123"
 *     responses:
 *       200:
 *         description: Login efetuado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Email não verificado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *             example:
 *               erro: true
 *               mensagem: "Email não verificado."
 *       401:
 *         description: Credenciais inválidas.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *             example:
 *               erro: true
 *               mensagem: "Credenciais inválidas."
 *       403:
 *         description: Conta desativada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *             example:
 *               erro: true
 *               mensagem: "Conta desativada."
 */
router.post("/iniciar-sessao", login);

/* =============================================================
   RECUPERAR SENHA
   ============================================================= */
/**
 * @swagger
 * /api/autenticacao/esqueci-palavra-passe:
 *   post:
 *     summary: Solicitar recuperação de senha
 *     description: |
 *       Envia um **código de recuperação** para o email indicado.
 *
 *       O código expira ao fim de **15 minutos**.
 *       Usa esse código em `/redefinir-palavra-passe` para definir uma nova senha.
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RecuperarSenhaInput'
 *           examples:
 *             exemplo:
 *               summary: Exemplo
 *               value:
 *                 email: "joao@email.com"
 *     responses:
 *       200:
 *         description: Código enviado para o email.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MensagemResponse'
 *             example:
 *               mensagem: "Código enviado para o email."
 *       403:
 *         description: Conta desativada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       404:
 *         description: Utilizador não encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.post("/esqueci-palavra-passe", recuperarSenha);

/* =============================================================
   REDEFINIR SENHA
   ============================================================= */
/**
 * @swagger
 * /api/autenticacao/redefinir-palavra-passe:
 *   post:
 *     summary: Redefinir palavra-passe
 *     description: |
 *       Define uma nova senha usando o código recebido por email.
 *
 *       ### Regras
 *       - O código deve ser usado dentro de **15 minutos**
 *       - A nova senha não pode ser igual à senha atual
 *       - A nova senha deve cumprir os mesmos requisitos do registo
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RedefinirSenhaInput'
 *           examples:
 *             exemplo:
 *               summary: Exemplo
 *               value:
 *                 email: "joao@email.com"
 *                 codigo: "839201"
 *                 novaSenha: "NovaSenha@456"
 *     responses:
 *       200:
 *         description: Palavra-passe redefinida com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MensagemResponse'
 *             example:
 *               mensagem: "Palavra-passe redefinida com sucesso."
 *       400:
 *         description: Código inválido/expirado ou senha igual à atual.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *             examples:
 *               codigoInvalido:
 *                 summary: Código inválido
 *                 value:
 *                   erro: true
 *                   mensagem: "Código inválido."
 *               senhaIgual:
 *                 summary: Senha igual à atual
 *                 value:
 *                   erro: true
 *                   mensagem: "A nova senha deve ser diferente da senha atual."
 *       404:
 *         description: Utilizador não encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.post("/redefinir-palavra-passe", redefinirSenha);

/* =============================================================
   LOGOUT
   ============================================================= */
/**
 * @swagger
 * /api/autenticacao/logout:
 *   post:
 *     summary: Terminar sessão
 *     description: |
 *       Invalida o **refresh token** armazenado na base de dados, terminando a sessão do utilizador.
 *
 *       O access token continua válido até expirar (máx. 15 min), mas o refresh token
 *       fica imediatamente inutilizável.
 *
 *       ### 🔒 Requer autenticação
 *       Envia o access token no header `Authorization: Bearer <token>`.
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sessão terminada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MensagemResponse'
 *             example:
 *               mensagem: "Sessão terminada com sucesso."
 *       401:
 *         description: Token não fornecido ou inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *             examples:
 *               semToken:
 *                 summary: Sem token
 *                 value:
 *                   erro: true
 *                   mensagem: "Token não fornecido."
 *               tokenInvalido:
 *                 summary: Token inválido ou expirado
 *                 value:
 *                   erro: true
 *                   mensagem: "Token inválido ou expirado."
 */
router.post("/logout", autenticar, logout);

/* =============================================================
   REFRESH TOKEN
   ============================================================= */
/**
 * @swagger
 * /api/autenticacao/refresh-token:
 *   post:
 *     summary: Renovar access token
 *     description: |
 *       Gera um novo **access token** e um novo **refresh token** a partir do refresh token atual.
 *
 *       Este endpoint usa **rotação de refresh tokens**: o token antigo é invalidado e um novo
 *       par de tokens é devolvido. Guarda sempre o novo `refreshToken`.
 *
 *       ### Quando usar
 *       Quando o access token expirar (erro 401 nas rotas protegidas), chama este endpoint
 *       com o refresh token guardado para obter um novo access token sem forçar novo login.
 *
 *       ### ⚠️ Não requer header Authorization
 *       O refresh token vai no **body** da requisição.
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenInput'
 *           examples:
 *             exemplo:
 *               summary: Exemplo
 *               value:
 *                 refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Novos tokens gerados com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RefreshTokenResponse'
 *       400:
 *         description: Refresh token em falta no body.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *             example:
 *               erro: true
 *               mensagem: "Refresh token em falta."
 *       401:
 *         description: Refresh token inválido, expirado ou já revogado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *             examples:
 *               invalido:
 *                 summary: Token inválido
 *                 value:
 *                   erro: true
 *                   mensagem: "Refresh token inválido ou expirado."
 *               revogado:
 *                 summary: Token revogado (logout já efetuado)
 *                 value:
 *                   erro: true
 *                   mensagem: "Refresh token inválido ou revogado."
 */
router.post("/refresh-token", refreshToken);

export default router;