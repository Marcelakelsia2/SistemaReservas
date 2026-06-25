import { Router } from "express";
import { criar, listar, ver, editar, remover } from "../controllers/tipoEquipamento.controller";
import { autenticar } from "../middlewares/autenticar";
import { permitirPapeis } from "../middlewares/permitirPapeis";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Tipos de Equipamento
 *   description: Gestão de tipos de equipamento
 */

// ─── CRIAR ────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/tipos-equipamento:
 *   post:
 *     summary: Criar tipo de equipamento
 *     description: |
 *       Cria um novo tipo de equipamento.
 *       - Nome normalizado (trim + espaços internos colapsados)
 *       - Comparação de duplicados case-insensitive
 *
 *       **Permissões:** ADMIN
 *     tags: [Tipos de Equipamento]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CriarTipoEquipamentoDTO'
 *     responses:
 *       201:
 *         description: Tipo de equipamento criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem: { type: string, example: Tipo de equipamento criado com sucesso. }
 *                 dados:
 *                   $ref: '#/components/schemas/TipoEquipamento'
 *       400:
 *         description: Nome em falta ou inválido
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
 *         description: Sem permissão (apenas ADMIN)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       409:
 *         description: Já existe um tipo com esse nome
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.post("/", autenticar, permitirPapeis("ADMIN"), criar);

// ─── LISTAR ───────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/tipos-equipamento:
 *   get:
 *     summary: Listar tipos de equipamento (paginado)
 *     description: |
 *       Lista os tipos de equipamento ordenados alfabeticamente.
 *
 *       **Permissões:** Todos os autenticados
 *     tags: [Tipos de Equipamento]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pagina
 *         schema: { type: integer, minimum: 1, default: 1 }
 *         description: Número da página (base 1)
 *       - in: query
 *         name: limite
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
 *         description: Itens por página (máximo 100)
 *     responses:
 *       200:
 *         description: Lista paginada de tipos de equipamento
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucesso: { type: boolean, example: true }
 *                 dados:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TipoEquipamento'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:        { type: integer, example: 5 }
 *                     pagina:       { type: integer, example: 1 }
 *                     limite:       { type: integer, example: 20 }
 *                     totalPaginas: { type: integer, example: 1 }
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.get("/", autenticar, listar);

// ─── VER ──────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/tipos-equipamento/{id}:
 *   get:
 *     summary: Ver detalhe de tipo de equipamento
 *     description: |
 *       Retorna o tipo de equipamento com a lista de equipamentos associados.
 *
 *       **Permissões:** Todos os autenticados
 *     tags: [Tipos de Equipamento]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 1
 *     responses:
 *       200:
 *         description: Tipo encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucesso: { type: boolean, example: true }
 *                 dados:
 *                   $ref: '#/components/schemas/TipoEquipamento'
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
 *       404:
 *         description: Tipo não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.get("/:id", autenticar, ver);

// ─── EDITAR ───────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/tipos-equipamento/{id}:
 *   patch:
 *     summary: Editar tipo de equipamento
 *     description: |
 *       Actualiza nome e/ou descrição.
 *       - Enviar `descricao` vazia remove-a
 *       - Body sem campos válidos devolve 400
 *
 *       **Permissões:** ADMIN
 *     tags: [Tipos de Equipamento]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EditarTipoEquipamentoDTO'
 *     responses:
 *       200:
 *         description: Tipo actualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem: { type: string, example: Tipo de equipamento atualizado com sucesso. }
 *                 dados:
 *                   $ref: '#/components/schemas/TipoEquipamento'
 *       400:
 *         description: ID inválido ou nenhum campo para actualizar
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
 *         description: Sem permissão (apenas ADMIN)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       404:
 *         description: Tipo não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       409:
 *         description: Já existe outro tipo com esse nome
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.patch("/:id", autenticar, permitirPapeis("ADMIN"), editar);

// ─── REMOVER ──────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/tipos-equipamento/{id}:
 *   delete:
 *     summary: Remover tipo de equipamento
 *     description: |
 *       Remove um tipo de equipamento.
 *
 *       ⚠️ Não é possível remover um tipo com equipamentos associados.
 *       Remove ou reatribui os equipamentos primeiro.
 *
 *       **Permissões:** ADMIN
 *     tags: [Tipos de Equipamento]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         example: 1
 *     responses:
 *       200:
 *         description: Tipo removido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem: { type: string, example: Tipo de equipamento removido com sucesso. }
 *                 dados:
 *                   $ref: '#/components/schemas/TipoEquipamento'
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
 *         description: Sem permissão (apenas ADMIN)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       404:
 *         description: Tipo não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       409:
 *         description: Existem equipamentos associados a este tipo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.delete("/:id", autenticar, permitirPapeis("ADMIN"), remover);

export default router;