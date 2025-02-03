// src/routes/index.ts
import { Router } from "express";
import authRoutes from "./auth";
import productRoutes from "./product";
import languageRoutes from "./language";

const router = Router();

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/languages", languageRoutes);

export default router;
