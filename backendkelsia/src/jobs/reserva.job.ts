import cron from "node-cron";
import * as service from "../services/reserva.service";

export function iniciarReservaJob() {
  cron.schedule("*/5 * * * *", async () => {
    await service.atualizarConcluidas();
    console.log("Reservas concluídas atualizadas");
  });
}