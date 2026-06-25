import { Router } from "express";

import {
  listarUtilizadores,
  meuPerfil,
  verUtilizador,
  atualizarPerfil,
  alterarPalavraPasse,
  alterarTipoUtilizador,
  alterarEstado,
  removerUtilizador,
} from "../controllers/utilizador.controller";

import { autenticar } from "../middlewares/autenticar";
import { permitirPapeis } from "../middlewares/permitirPapeis";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Utilizadores
 *   description: Gestão de utilizadores do sistema
 */

// ─── LISTAR ───────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/utilizadores:
 *   get:
 *     summary: Listar utilizadores (paginado)
 *     description: |
 *       Lista os utilizadores activos do sistema com suporte a paginação.
 *
 *       **Permissões:** ADMIN, FUNCIONARIO
 *
 *     tags: [Utilizadores]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página (base 1)
 *
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Itens por página (máximo 100)
 *
 *     responses:
 *       200:
 *         description: Lista paginada de utilizadores
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dados:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UtilizadorPublico'
 *                 meta:
 *                   type: object
 *                   properties:
 *                   
 *                    total: { type: integer, example: 42 }
 *                    pagina: { type: integer, example: 1 }
 *                    limite: { type: integer, example: 20 }
 *                    totalPaginas: { type: integer, example: 3 } 
 *       401:
 *         description: Token inválido ou não enviado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       403:
 *         description: Sem permissão
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.get(
  "/",
  autenticar,
  permitirPapeis("ADMIN", "FUNCIONARIO"),
  listarUtilizadores
);

// ─── MEU PERFIL ───────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/utilizadores/me:
 *   get:
 *     summary: Ver perfil autenticado
 *     description: |
 *       Retorna os dados do utilizador autenticado.
 *
 *       **Permissões:** Todos os autenticados
 *
 *     tags: [Utilizadores]
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Perfil do utilizador
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UtilizadorPublico'
 *       401:
 *         description: Token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.get("/me", autenticar, meuPerfil);

// ─── EDITAR PERFIL ────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/utilizadores/me:
 *   patch:
 *     summary: Atualizar perfil
 *     description: |
 *       Permite ao utilizador autenticado actualizar o próprio perfil.
 *
 *       - **nome** — mínimo 2 palavras
 *       - **telefone** — formato internacional obrigatório (ex: `+244923000000`)
 *       - **email** — se alterado, é enviado um código de verificação para o novo endereço e o login fica suspenso até confirmação
 *
 *       **Permissões:** Todos os autenticados
 *
 *     tags: [Utilizadores]
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 example: João Manuel Silva
 *               telefone:
 *                 type: string
 *                 example: "+244923000000"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: novo@email.com
 *
 *     responses:
 *       200:
 *         description: Perfil actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: Perfil atualizado com sucesso.
 *                 usuario:
 *                   $ref: '#/components/schemas/UtilizadorPublico'
 *                 aviso:
 *                   type: string
 *                   example: O novo email precisa de ser verificado antes de poder ser usado para login.
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroValidacao'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       409:
 *         description: Email já utilizado por outro utilizador
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.patch("/me", autenticar, atualizarPerfil);

// ─── ALTERAR PALAVRA-PASSE ────────────────────────────────────────────────────

/**
 * @swagger
 * /api/utilizadores/me/palavra-passe:
 *   patch:
 *     summary: Alterar palavra-passe
 *     description: |
 *       Permite alterar a palavra-passe da conta autenticada.
 *
 *       Regras da nova senha:
 *       - Mínimo 8 caracteres
 *       - Pelo menos uma letra maiúscula e uma minúscula
 *       - Pelo menos um número e um símbolo
 *       - Não pode ser igual à senha actual
 *
 *       **Permissões:** Todos os autenticados
 *
 *     tags: [Utilizadores]
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - senhaAtual
 *               - novaSenha
 *             properties:
 *               senhaAtual:
 *                 type: string
 *                 format: password
 *                 example: Senha@123
 *               novaSenha:
 *                 type: string
 *                 format: password
 *                 example: NovaSenha@456
 *
 *     responses:
 *       200:
 *         description: Palavra-passe alterada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MensagemResponse'
 *       400:
 *         description: Senha actual incorrecta ou nova senha inválida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.patch("/me/palavra-passe", autenticar, alterarPalavraPasse);

// ─── VER UTILIZADOR ───────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/utilizadores/{id}:
 *   get:
 *     summary: Ver utilizador por ID
 *     description: |
 *       Retorna os dados de um utilizador específico.
 *
 *       **Permissões:** ADMIN, FUNCIONARIO
 *
 *     tags: [Utilizadores]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *
 *     responses:
 *       200:
 *         description: Utilizador encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UtilizadorPublico'
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       403:
 *         description: Sem permissão
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       404:
 *         description: Utilizador não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.get(
  "/:id",
  autenticar,
  permitirPapeis("ADMIN", "FUNCIONARIO"),
  verUtilizador
);

// ─── ALTERAR ROLE ─────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/utilizadores/{id}/tipo:
 *   patch:
 *     summary: Alterar tipo de utilizador
 *     description: |
 *       Altera o papel (role) de um utilizador.
 *
 *       ⚠️ Um administrador não pode alterar o próprio tipo por esta via.
 *
 *       **Permissões:** ADMIN
 *
 *     tags: [Utilizadores]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 2
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [ADMIN, FUNCIONARIO, USUARIO]
 *                 example: FUNCIONARIO
 *
 *     responses:
 *       200:
 *         description: Tipo alterado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem: { type: string, example: Tipo de utilizador alterado. }
 *                 utilizador:
 *                   type: object
 *                   properties:
 *                     id:    { type: integer, example: 2 }
 *                     nome:  { type: string,  example: João Silva }
 *                     email: { type: string,  example: joao@email.com }
 *                     role:  { type: string,  example: FUNCIONARIO }
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroValidacao'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       403:
 *         description: Sem permissão ou tentativa de alterar o próprio role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       404:
 *         description: Utilizador não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.patch(
  "/:id/tipo",
  autenticar,
  permitirPapeis("ADMIN"),
  alterarTipoUtilizador
);

// ─── ALTERAR ESTADO ───────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/utilizadores/{id}/estado:
 *   patch:
 *     summary: Bloquear ou desbloquear utilizador
 *     description: |
 *       Activa ou desactiva a conta de um utilizador.
 *
 *       ⚠️ Um administrador não pode inativar a sua própria conta.
 *
 *       **Permissões:** ADMIN
 *
 *     tags: [Utilizadores]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 2
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ativo
 *             properties:
 *               ativo:
 *                 type: boolean
 *                 example: false
 *
 *     responses:
 *       200:
 *         description: Estado alterado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem: { type: string, example: Estado alterado com sucesso. }
 *                 utilizador:
 *                   type: object
 *                   properties:
 *                     id:    { type: integer, example: 2 }
 *                     nome:  { type: string,  example: João Silva }
 *                     email: { type: string,  example: joao@email.com }
 *                     ativo: { type: boolean, example: false }
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       403:
 *         description: Sem permissão ou tentativa de inativar a própria conta
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       404:
 *         description: Utilizador não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.patch(
  "/:id/estado",
  autenticar,
  permitirPapeis("ADMIN"),
  alterarEstado
);

// ─── REMOVER ──────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/utilizadores/{id}:
 *   delete:
 *     summary: Remover utilizador (soft delete)
 *     description: |
 *       Desactiva permanentemente a conta do utilizador (soft delete — o registo é preservado na base de dados).
 *
 *       ⚠️ Um administrador não pode remover a sua própria conta.
 *
 *       **Permissões:** ADMIN
 *
 *     tags: [Utilizadores]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 2
 *
 *     responses:
 *       200:
 *         description: Utilizador removido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MensagemResponse'
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       403:
 *         description: Sem permissão ou tentativa de remover a própria conta
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       404:
 *         description: Utilizador não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       409:
 *         description: Utilizador já foi removido anteriormente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.delete(
  "/:id",
  autenticar,
  permitirPapeis("ADMIN"),
  removerUtilizador
);

export default router;