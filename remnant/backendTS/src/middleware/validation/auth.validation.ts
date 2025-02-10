// src/middleware/validation.middleware.ts
import { Request, Response, NextFunction } from "express";
import { z } from "zod";

const loginSchema = z.object({
  login: z.string(),
  password: z.string(),
  type: z.string(),
});

export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    loginSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ error: "Invalid login data" });
  }
};
