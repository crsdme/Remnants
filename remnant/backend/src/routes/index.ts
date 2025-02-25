// src/routes/index.ts
import { Router } from "express";
import authRoutes from "./auth";
import productRoutes from "./product";
import languageRoutes from "./language";
import unitsRoutes from "./unit";
import categoriesRoutes from "./category";
import { authenticateJWT } from "../middleware/auth.middleware";

const router = Router();

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/languages", authenticateJWT, languageRoutes);
router.use("/units", authenticateJWT, unitsRoutes);
router.use("/categories", authenticateJWT, categoriesRoutes);

export default router;
