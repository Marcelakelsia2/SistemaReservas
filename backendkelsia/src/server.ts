import dotenv from "dotenv";
dotenv.config();

import { iniciarReservaJob } from "./jobs/reserva.job";
import "./jobs/reservaEquipamento.job";

import app from "./app";

const PORTA = process.env.PORT || 3000;

app.listen(PORTA, () => {
  console.log(`Servidor a correr na porta ${PORTA}`);
});
iniciarReservaJob();