import { Router } from "express";
import {
  criar,
  listar,
  ver,
  editar,
  disponibilidade,
  quantidade,
  disponiveis,
  remover,
} from "../controllers/equipamento.controller";
import { autenticar } from "../middlewares/autenticar";
import { permitirPapeis } from "../middlewares/permitirPapeis";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Equipamentos
 *   description: Gestão de equipamentos
 */

// ─── CRIAR ────────────────────────────────────────────────────────────────────
/**
 * @swagger
 * /api/equipamentos:
 *   post:
 *     summary: Criar equipamento
 *     tags: [Equipamentos]
 *     security:
 *       - bearerAuth: []
 *     description: Apenas ADMIN
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - codigo
 *               - nome
 *               - quantidadeTotal
 *               - quantidadeDisponivel
 *               - tipoEquipamentoId
 *             properties:
 *               codigo:
 *                 type: string
 *                 example: PROJ001
 *               nome:
 *                 type: string
 *                 example: Projetor Epson
 *               descricao:
 *                 type: string
 *                 example: Projetor Full HD
 *               quantidadeTotal:
 *                 type: integer
 *                 example: 10
 *               quantidadeDisponivel:
 *                 type: integer
 *                 example: 10
 *               tipoEquipamentoId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Equipamento criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       409:
 *         description: Código já existe
 */
router.post(
  "/",
  autenticar,
  permitirPapeis("ADMIN"),
  criar
);

//  rota estática /disponiveis declarada ANTES de /:id
// Se ficar depois, o Express captura "disponiveis" como id e a rota nunca é alcançada
/**
 * @swagger
 * /api/equipamentos/disponiveis:
 *   get:
 *     summary: Ver equipamentos disponíveis
 *     tags: [Equipamentos]
 *     security:
 *       - bearerAuth: []
 *     description: Devolve equipamentos com estado DISPONIVEL e quantidade > 0
 *     responses:
 *       200:
 *         description: Lista de equipamentos disponíveis
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get(
  "/disponiveis",
  autenticar,
  permitirPapeis("ADMIN", "FUNCIONARIO", "USUARIO"),
  disponiveis
);

// ─── LISTAR ───────────────────────────────────────────────────────────────────
/**
 * @swagger
 * /api/equipamentos:
 *   get:
 *     summary: Listar equipamentos
 *     tags: [Equipamentos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de equipamentos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get(
  "/",
  autenticar,
  permitirPapeis("ADMIN", "FUNCIONARIO", "USUARIO"),
  listar
);

// ─── VER ──────────────────────────────────────────────────────────────────────
/**
 * @swagger
 * /api/equipamentos/{id}:
 *   get:
 *     summary: Ver equipamento por ID
 *     tags: [Equipamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Equipamento encontrado
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Equipamento não encontrado
 */
router.get(
  "/:id",
  autenticar,
  permitirPapeis("ADMIN", "FUNCIONARIO", "USUARIO"),
  ver
);

// ─── EDITAR ───────────────────────────────────────────────────────────────────
/**
 * @swagger
 * /api/equipamentos/{id}:
 *   patch:
 *     summary: Editar equipamento
 *     tags: [Equipamentos]
 *     security:
 *       - bearerAuth: []
 *     description: Apenas ADMIN
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 example: Projetor Epson X2
 *               descricao:
 *                 type: string
 *               quantidadeTotal:
 *                 type: integer
 *                 example: 15
 *               quantidadeDisponivel:
 *                 type: integer
 *                 example: 12
 *               tipoEquipamentoId:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Equipamento actualizado
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Equipamento não encontrado
 *       409:
 *         description: Código já em uso
 */
router.patch(
  "/:id",
  autenticar,
  permitirPapeis("ADMIN"),
  editar
);

// ─── DISPONIBILIDADE ──────────────────────────────────────────────────────────
/**
 * @swagger
 * /api/equipamentos/{id}/disponibilidade:
 *   patch:
 *     summary: Alterar estado do equipamento
 *     tags: [Equipamentos]
 *     security:
 *       - bearerAuth: []
 *     description: ADMIN e FUNCIONARIO
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - estado
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [DISPONIVEL, INDISPONIVEL, MANUTENCAO]
 *                 example: DISPONIVEL
 *     responses:
 *       200:
 *         description: Estado actualizado
 *       400:
 *         description: Estado inválido
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Equipamento não encontrado
 */
router.patch(
  "/:id/disponibilidade",
  autenticar,
  permitirPapeis("ADMIN", "FUNCIONARIO"),
  disponibilidade
);

// ─── QUANTIDADE ───────────────────────────────────────────────────────────────
/**
 * @swagger
 * /api/equipamentos/{id}/quantidade:
 *   patch:
 *     summary: Alterar quantidade
 *     tags: [Equipamentos]
 *     security:
 *       - bearerAuth: []
 *     description: ADMIN e FUNCIONARIO
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantidadeTotal
 *             properties:
 *               quantidadeTotal:
 *                 type: integer
 *                 example: 10
 *     responses:
 *       200:
 *         description: Quantidade actualizada
 *       400:
 *         description: Quantidade inválida
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Equipamento não encontrado
 */
router.patch(
  "/:id/quantidade",
  autenticar,
  permitirPapeis("ADMIN", "FUNCIONARIO"),
  quantidade
);

// ─── REMOVER ──────────────────────────────────────────────────────────────────
/**
 * @swagger
 * /api/equipamentos/{id}:
 *   delete:
 *     summary: Remover equipamento
 *     tags: [Equipamentos]
 *     security:
 *       - bearerAuth: []
 *     description: Apenas ADMIN
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Equipamento removido
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Equipamento não encontrado
 *       409:
 *         description: Equipamento com reservas associadas
 */
router.delete(
  "/:id",
  autenticar,
  permitirPapeis("ADMIN"),
  remover
);

export default router;