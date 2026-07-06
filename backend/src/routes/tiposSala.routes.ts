import { Router } from "express";
import * as controller from "../controllers/tipoSala.controller";

import { autenticar } from "../middlewares/autenticar";
import { permitirPapeis } from "../middlewares/permitirPapeis";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Tipos de Sala
 *   description: Gestão de tipos de sala
 */

// ─── CRIAR ────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/tipos-sala:
 *   post:
 *     summary: Criar tipo de sala
 *     description: |
 *       Cria um novo tipo de sala.
 *       - O nome é normalizado (trim + espaços internos colapsados)
 *       - A comparação de duplicados é case-insensitive
 *
 *       **Permissões:** ADMIN
 *     tags: [Tipos de Sala]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *             properties:
 *               nome:
 *                 type: string
 *                 example: Sala de Reuniões
 *               descricao:
 *                 type: string
 *                 example: Sala equipada para reuniões formais
 *     responses:
 *       201:
 *         description: Tipo de sala criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem: { type: string, example: Tipo de sala criado com sucesso. }
 *                 dados:
 *                   $ref: '#/components/schemas/TipoSala'
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
 *         description: Já existe um tipo de sala com esse nome
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.post("/", autenticar, permitirPapeis("ADMIN"), controller.criar);

// ─── LISTAR ───────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/tipos-sala:
 *   get:
 *     summary: Listar tipos de sala (paginado)
 *     description: |
 *       Devolve a lista de tipos de sala ordenada alfabeticamente, com suporte a paginação.
 *
 *       **Permissões:** Todos os autenticados
 *     tags: [Tipos de Sala]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página (base 1)
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Itens por página (máximo 100)
 *     responses:
 *       200:
 *         description: Lista paginada de tipos de sala
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucesso: { type: boolean, example: true }
 *                 dados:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TipoSala'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:        { type: integer, example: 8 }
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
router.get("/", autenticar, controller.listar);

// ─── VER POR ID ───────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/tipos-sala/{id}:
 *   get:
 *     summary: Ver tipo de sala por ID
 *     description: |
 *       Retorna o detalhe de um tipo de sala específico.
 *
 *       **Permissões:** Todos os autenticados
 *     tags: [Tipos de Sala]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Tipo de sala encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucesso: { type: boolean, example: true }
 *                 dados:
 *                   $ref: '#/components/schemas/TipoSala'
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
 *         description: Tipo de sala não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.get("/:id", autenticar, controller.ver);

// ─── EDITAR ───────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/tipos-sala/{id}:
 *   patch:
 *     summary: Actualizar tipo de sala
 *     description: |
 *       Actualiza o nome e/ou descrição de um tipo de sala.
 *       - Enviar `descricao` como string vazia remove a descrição
 *       - Body sem campos válidos devolve 400
 *
 *       **Permissões:** ADMIN
 *     tags: [Tipos de Sala]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 example: Sala VIP
 *               descricao:
 *                 type: string
 *                 example: Sala premium com equipamento completo
 *     responses:
 *       200:
 *         description: Actualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem: { type: string, example: Tipo de sala atualizado com sucesso. }
 *                 dados:
 *                   $ref: '#/components/schemas/TipoSala'
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
 *         description: Tipo de sala não encontrado
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
router.patch("/:id", autenticar, permitirPapeis("ADMIN"), controller.editar);

// ─── REMOVER ──────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/tipos-sala/{id}:
 *   delete:
 *     summary: Remover tipo de sala
 *     description: |
 *       Remove um tipo de sala.
 *
 *       ⚠️ Não é possível remover um tipo que tenha salas associadas.
 *       Reatribui ou remove as salas primeiro.
 *
 *       **Permissões:** ADMIN
 *     tags: [Tipos de Sala]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Removido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem: { type: string, example: Tipo de sala removido com sucesso. }
 *                 dados:
 *                   $ref: '#/components/schemas/TipoSala'
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
 *         description: Tipo de sala não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       409:
 *         description: Existem salas associadas a este tipo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.delete("/:id", autenticar, permitirPapeis("ADMIN"), controller.remover);

export default router;