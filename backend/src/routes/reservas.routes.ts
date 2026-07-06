import { Router } from "express";
import {
  criar,
  listar,
  minhas,
  ver,
  cancelar,
  editar,
  disponibilidade,  comprovativo,
} from "../controllers/reserva.controller";

import { autenticar } from "../middlewares/autenticar";
import { permitirPapeis } from "../middlewares/permitirPapeis";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Reservas
 *   description: Gestão de reservas de salas
 */

//
// =======================
// CRIAR RESERVA
// =======================
/**
 * @swagger
 * /api/reservas:
 *   post:
 *     summary: Criar reserva de sala
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - salaId
 *               - data
 *               - horaInicio
 *               - horaFim
 *             properties:
 *               salaId:
 *                 type: integer
 *                 example: 1
 *               data:
 *                 type: string
 *                 format: date
 *                 example: "2026-06-10"
 *               horaInicio:
 *                 type: string
 *                 example: "08:00"
 *               horaFim:
 *                 type: string
 *                 example: "10:00"
 *               observacao:
 *                 type: string
 *                 example: "Reunião de equipa"
 *     responses:
 *       201:
 *         description: Reserva criada com sucesso
 *       400:
 *         description: Dados inválidos ou conflito de horário
 *       401:
 *         description: Não autenticado
 */
router.post(
  "/",
  autenticar,
  permitirPapeis("ADMIN", "FUNCIONARIO", "USUARIO"),
  criar
);

//
// =======================
// LISTAR TODAS
// =======================
/**
 * @swagger
 * /api/reservas:
 *   get:
 *     summary: Listar todas as reservas
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de reservas
 */
router.get(
  "/",
  autenticar,
  permitirPapeis("ADMIN", "FUNCIONARIO"),
  listar
);

//
// =======================
// MINHAS RESERVAS
// =======================
/**
 * @swagger
 * /api/reservas/minhas:
 *   get:
 *     summary: Listar minhas reservas
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista do utilizador autenticado
 */
router.get(
  "/minhas",
  autenticar,
  permitirPapeis("USUARIO"),
  minhas
);

//
// =======================
// DISPONIBILIDADE DA SALA
// =======================
/**
 * @swagger
 * /api/reservas/sala/{salaId}/disponibilidade/{data}:
 *   get:
 *     summary: Ver disponibilidade da sala
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: salaId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: path
 *         name: data
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: "2026-06-10"
 *     responses:
 *       200:
 *         description: Disponibilidade retornada com sucesso
 *       404:
 *         description: Sala não encontrada
 */
router.get(
  "/sala/:salaId/disponibilidade/:data",
  autenticar,
  permitirPapeis("ADMIN", "FUNCIONARIO", "USUARIO"),
  disponibilidade
);

//
// =======================
// VER RESERVA
// =======================
/**
 * @swagger
 * /api/reservas/{id}:
 *   get:
 *     summary: Ver reserva por ID
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 5
 *     responses:
 *       200:
 *         description: Reserva encontrada
 *       404:
 *         description: Reserva não encontrada
 */
router.get(
  "/:id",
  autenticar,
  permitirPapeis("ADMIN", "FUNCIONARIO", "USUARIO"),
  ver
);

//
// =======================
// EDITAR RESERVA
// =======================
/**
 * @swagger
 * /api/reservas/{id}:
 *   patch:
 *     summary: Editar reserva
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 5
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               salaId:
 *                 type: integer
 *                 example: 1
 *               data:
 *                 type: string
 *                 format: date
 *                 example: "2026-06-10"
 *               horaInicio:
 *                 type: string
 *                 example: "09:00"
 *               horaFim:
 *                 type: string
 *                 example: "11:00"
 *               observacao:
 *                 type: string
 *                 example: "Reunião atualizada"
 *               motivoEdicao:
 *                 type: string
 *                 example: "Pedido do utilizador"
 *     responses:
 *       200:
 *         description: Reserva editada com sucesso
 *       400:
 *         description: Dados inválidos ou conflito de horário
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Reserva não encontrada
 */
router.patch(
  "/:id",
  autenticar,
  permitirPapeis("ADMIN", "FUNCIONARIO", "USUARIO"),
  editar
);

//
// =======================
// CANCELAR RESERVA
// =======================
/**
 * @swagger
 * /api/reservas/{id}/cancelar:
 *   patch:
 *     summary: Cancelar reserva
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 5
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               motivo:
 *                 type: string
 *                 example: "Sala indisponível"
 *     responses:
 *       200:
 *         description: Reserva cancelada com sucesso
 *       400:
 *         description: Reserva já cancelada ou concluída
 */
router.patch(
  "/:id/cancelar",
  autenticar,
  permitirPapeis("ADMIN", "FUNCIONARIO", "USUARIO"),
  cancelar
);

/**
 * @swagger
 * /api/reservas/{id}/comprovativo:
 *   get:
 *     summary: Baixar comprovativo de reserva de sala
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 5
 *     responses:
 *       200:
 *         description: PDF gerado com sucesso
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Reserva não encontrada
 */
router.get(
  "/:id/comprovativo",
  autenticar,
  permitirPapeis("ADMIN", "FUNCIONARIO", "USUARIO"),
  comprovativo
);

export default router;