import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import { errorMiddleware } from "./middlewares/error";
import rotas from "./routes";
import passport from "./config/passport";

const app = express();

// ✅ CORS configurado para produção
const origens = [
  process.env.FRONTEND_URL || "http://localhost:5173",
];

app.use(cors({
  origin: origens,
  credentials: true, 
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
}));

app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));
app.use(passport.initialize());

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api", rotas);

app.use(errorMiddleware);

export default app;