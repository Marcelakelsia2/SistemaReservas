import cron from "node-cron";
import { atualizarConcluidas } from "../services/reservaEquipamento.service";

cron.schedule("*/10 * * * *", async () => {
  try {
    const result = await atualizarConcluidas();

    console.log(
      `[JOB] Reservas de equipamentos atualizadas: ${result.count}`
    );
  } catch (error) {
    console.error("[JOB ERROR] atualizarConcluidas:", error);
  }
});