import { Request, Response, NextFunction } from "express";
import * as CategoryService from "../services/category.service";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceResponse = await CategoryService.get(req.body);

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
    const serviceResponse = await CategoryService.create(req.body);

    res.status(200).json(serviceResponse);
  } catch (err) {
    next(err);
  }
};

export const edit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const serviceResponse = await CategoryService.edit(req.body);

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
    const serviceResponse = await CategoryService.remove(req.body);

    res.status(200).json(serviceResponse);
  } catch (err) {
    next(err);
  }
};
