import { Router } from "express";
import {
  criar,
  listar,
  minhas,
  ver,
  cancelar,
  editar,
  disponibilidade, comprovativo,
} from "../controllers/reservaEquipamento.controller";

import { autenticar } from "../middlewares/autenticar";
import { permitirPapeis } from "../middlewares/permitirPapeis";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: ReservasEquipamento
 *   description: Gestão de reservas de equipamentos
 */

//
// =======================
// CRIAR RESERVA
// =======================
/**
 * @swagger
 * /api/reservas-equipamento:
 *   post:
 *     summary: Criar reserva de equipamento
 *     tags: [ReservasEquipamento]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - equipamentoId
 *               - quantidade
 *               - data
 *               - horaInicio
 *               - horaFim
 *             properties:
 *               equipamentoId:
 *                 type: integer
 *                 example: 1
 *               quantidade:
 *                 type: integer
 *                 example: 2
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
 *                 example: "Para apresentação"
 *     responses:
 *       201:
 *         description: Reserva criada com sucesso
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: Quantidade indisponível para o horário
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
 * /api/reservas-equipamento:
 *   get:
 *     summary: Listar todas as reservas de equipamento
 *     tags: [ReservasEquipamento]
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
 * /api/reservas-equipamento/minhas:
 *   get:
 *     summary: Listar as minhas reservas de equipamento
 *     tags: [ReservasEquipamento]
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
// DISPONIBILIDADE
// =======================
/**
 * @swagger
 * /api/reservas-equipamento/equipamento/{equipamentoId}/disponibilidade:
 *   get:
 *     summary: Ver disponibilidade de um equipamento numa data
 *     tags: [ReservasEquipamento]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: equipamentoId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: query
 *         name: data
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: "2026-06-10"
 *     responses:
 *       200:
 *         description: Disponibilidade retornada com sucesso
 *       400:
 *         description: Data inválida ou em falta
 *       404:
 *         description: Equipamento não encontrado
 */
router.get(
  "/equipamento/:equipamentoId/disponibilidade",
  autenticar,
  permitirPapeis("ADMIN", "FUNCIONARIO", "USUARIO"),
  disponibilidade
);

//COMPROVATIVO

/**
 * @swagger
 * /api/reservas-equipamento/{id}/comprovativo:
 *   get:
 *     summary: Baixar comprovativo de reserva de equipamento
 *     tags: [ReservasEquipamento]
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

//
// =======================
// VER RESERVA
// =======================
/**
 * @swagger
 * /api/reservas-equipamento/{id}:
 *   get:
 *     summary: Ver reserva de equipamento por ID
 *     tags: [ReservasEquipamento]
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
 *       403:
 *         description: Sem permissão
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
// CANCELAR RESERVA
// =======================
/**
 * @swagger
 * /api/reservas-equipamento/{id}/cancelar:
 *   patch:
 *     summary: Cancelar reserva de equipamento
 *     tags: [ReservasEquipamento]
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
 *                 example: "Equipamento avariado"
 *     responses:
 *       200:
 *         description: Reserva cancelada com sucesso
 *       400:
 *         description: Reserva já cancelada ou concluída / motivo em falta
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Reserva não encontrada
 */
router.patch(
  "/:id/cancelar",
  autenticar,
  permitirPapeis("ADMIN", "FUNCIONARIO", "USUARIO"),
  cancelar
);

//
// =======================
// EDITAR RESERVA
// =======================
/**
 * @swagger
 * /api/reservas-equipamento/{id}:
 *   patch:
 *     summary: Editar reserva de equipamento
 *     tags: [ReservasEquipamento]
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
 *               equipamentoId:
 *                 type: integer
 *                 example: 1
 *               quantidade:
 *                 type: integer
 *                 example: 3
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
 *                 example: "Actualização da reserva"
 *               motivoEdicao:
 *                 type: string
 *                 example: "Pedido do utilizador"
 *     responses:
 *       200:
 *         description: Reserva editada com sucesso
 *       400:
 *         description: Dados inválidos ou horário no passado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Reserva não encontrada
 *       409:
 *         description: Quantidade indisponível para o horário
 */
router.patch(
  "/:id",
  autenticar,
  permitirPapeis("ADMIN", "FUNCIONARIO", "USUARIO"),
  editar
);

export default router;