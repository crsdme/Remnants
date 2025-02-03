// src/middleware/validation.middleware.ts
import { Request, Response, NextFunction } from "express";
import { z } from "zod";

const getProductSchema = z.object({
  filters: z.any(),
});

export const validateGetProduct = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    getProductSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ error: "Invalid get prdocuts data" });
  }
};
