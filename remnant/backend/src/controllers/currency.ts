import { Request, Response, NextFunction } from "express";
import * as CurrencyService from "../services/currency.service";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceResponse = await CurrencyService.get(req.body);

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    await sleep(1000);

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
    const serviceResponse = await CurrencyService.create(req.body);

    res.status(200).json(serviceResponse);
  } catch (err) {
    next(err);
  }
};

export const edit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceResponse = await CurrencyService.edit(req.body);

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
    const serviceResponse = await CurrencyService.remove(req.body);

    res.status(200).json(serviceResponse);
  } catch (err) {
    next(err);
  }
};

export const batch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const serviceResponse = await CurrencyService.batch(req.body);

    res.status(200).json(serviceResponse);
  } catch (err) {
    next(err);
  }
};

export const importCurrencies = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      throw new Error("No file uploaded");
    }
    const serviceResponse = await CurrencyService.importCurrencies({
      file: req.file,
    });

    res.status(200).json(serviceResponse);
  } catch (err) {
    next(err);
  }
};
