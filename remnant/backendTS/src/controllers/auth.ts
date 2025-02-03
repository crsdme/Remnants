// src/controllers/auth.controller.ts
import { Request, Response, NextFunction } from "express";
import * as AuthService from "../services/auth.service";

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const token = await AuthService.login(email, password);
    res.status(200).json({ token });
  } catch (err) {
    next(err);
  }
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const user = await AuthService.register(email, password);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};
