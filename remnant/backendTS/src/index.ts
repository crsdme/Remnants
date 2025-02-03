// src/app.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes/";
import { errorHandler } from "./middleware/error.middleware";

const app = express();

// Настройка middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Подключение маршрутов (например, /api/auth, /api/users и т.п.)
app.use("/api", routes);

// Глобальный обработчик ошибок
app.use(errorHandler);

export default app;
