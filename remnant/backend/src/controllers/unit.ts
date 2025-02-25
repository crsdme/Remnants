// src/controllers/auth.controller.ts
import { Request, Response, NextFunction } from "express";
import * as UnitService from "../services/unit.service";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceResponse = await UnitService.get(req.body);

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
    const serviceResponse = await UnitService.create(req.body);

    res.status(200).json(serviceResponse);
  } catch (err) {
    next(err);
  }
};

export const edit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceResponse = await UnitService.edit(req.body);

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
    const serviceResponse = await UnitService.remove(req.body);

    res.status(200).json(serviceResponse);
  } catch (err) {
    next(err);
  }
};
