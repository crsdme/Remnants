// src/controllers/auth.controller.ts
import { Request, Response, NextFunction } from "express";
import * as LanguageService from "../services/language.service";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceResponse = await LanguageService.get(req.body);

    res.status(200).json(serviceResponse);
  } catch (err) {
    next(err);
  }
};

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const serviceResponse = await LanguageService.create(req.body);

    res.status(200).json(serviceResponse);
  } catch (err) {
    next(err);
  }
};

export const edit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceResponse = await LanguageService.edit(req.body);

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    await sleep(1000);

    res.status(200).json(serviceResponse);
  } catch (err) {
    next(err);
  }
};

export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const serviceResponse = await LanguageService.remove(req.body);

    res.status(200).json(serviceResponse);
  } catch (err) {
    next(err);
  }
};
