// src/middleware/validation.middleware.ts
import { Request, Response, NextFunction } from "express";
import { z } from "zod";

const getCurrencySchema = z.object({
  pagination: z.object({
    current: z.preprocess((val) => Number(val), z.number()).optional(),
    pageSize: z.preprocess((val) => Number(val), z.number()).optional(),
    full: z.preprocess((val) => Boolean(val), z.boolean()).optional(),
  }),
});

export const validateGetCurrencies = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = getCurrencySchema.safeParse(req.query);
    console.log("@", result.error);
    req.body = result.data;
    next();
  } catch (error) {
    res.status(400).json({ error: "Invalid get language data" });
  }
};
