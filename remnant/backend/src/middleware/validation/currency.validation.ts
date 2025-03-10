// src/middleware/validation.middleware.ts
import { Request, Response, NextFunction } from "express";
import { z } from "zod";

const getCurrencySchema = z.object({
  pagination: z
    .object({
      current: z.preprocess((val) => Number(val), z.number()).optional(),
      pageSize: z.preprocess((val) => Number(val), z.number()).optional(),
      full: z.preprocess((val) => Boolean(val), z.boolean()).optional(),
    })
    .optional(),
  filters: z
    .object({
      names: z.string().optional(),
      symbols: z.string().optional(),
      language: z.string(),
    })
    .optional(),
  sorters: z
    .object({
      names: z.preprocess((val) => Number(val), z.number()).optional(),
      priority: z.preprocess((val) => Number(val), z.number()).optional(),
      updatedAt: z.preprocess((val) => Number(val), z.number()).optional(),
      createdAt: z.preprocess((val) => Number(val), z.number()).optional(),
    })
    .optional(),
});

export const validateGetCurrencies = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = getCurrencySchema.safeParse(req.query);
    req.body = result.data;
    next();
  } catch (error) {
    res.status(400).json({ error: "Invalid get language data" });
  }
};
