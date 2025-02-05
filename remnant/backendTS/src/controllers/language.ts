// src/controllers/auth.controller.ts
import { Request, Response, NextFunction } from "express";
import * as LanguageService from "../services/language.service";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const languages = await LanguageService.get(req.body);

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    await sleep(1000);

    res.status(200).json({ data: languages });
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
    const languages = await LanguageService.create(req.body);

    res.status(200).json({ data: languages });
  } catch (err) {
    next(err);
  }
};

export const edit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const languages = await LanguageService.edit(req.body);

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    await sleep(1000);

    res.status(200).json({ data: languages });
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
    console.log(req.body);
    const languages = await LanguageService.remove(req.body);

    res.status(200).json({ data: languages });
  } catch (err) {
    next(err);
  }
};
