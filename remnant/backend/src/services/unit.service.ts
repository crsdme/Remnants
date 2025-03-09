import UnitModel, { UnitInterface } from "../models/unit";
import mongoose, { ObjectId, Schema } from "mongoose";

interface getUnitsResult {
  units: any[];
  unitsCount: number;
}

interface getUnitsParams {
  filters: any[];
  sorters: any[];
  pagination: {
    current: number;
    pageSize: number;
  };
}

export const get = async (payload: getUnitsParams): Promise<getUnitsResult> => {
  const { current = 1, pageSize = 10 } = payload.pagination;
  let query = { removed: false };

  let pipeline = [
    {
      $match: query,
    },
  ];

  let unitsCount = await UnitModel.countDocuments(query);

  let unitsQuery = UnitModel.aggregate(pipeline);

  unitsQuery = unitsQuery.skip((current - 1) * pageSize).limit(pageSize);

  const units = await unitsQuery.exec();

  if (!units) {
    throw new Error("Units not found");
  }

  return { units, unitsCount };
};

interface createUnitResult {
  unit: any;
}

interface createUnitParams {
  names: object;
  symbols: object;
  priority: number;
  active?: boolean;
}

export const create = async (
  payload: createUnitParams
): Promise<createUnitResult> => {
  let unit = await UnitModel.create(payload);

  if (!unit) {
    throw new Error("Unit not created");
  }

  return { unit };
};

interface editUnitsResult {
  unit: any;
}

interface editUnitParams {
  _id: string;
  name: string;
  code: string;
  main?: boolean;
  active?: boolean;
}

export const edit = async (
  payload: editUnitParams
): Promise<editUnitsResult> => {
  const { _id } = payload;

  if (!_id) {
    throw new Error("Need _ID");
  }

  let unit = await UnitModel.updateOne({ _id }, payload);

  if (!unit) {
    throw new Error("unit not edited");
  }

  return { unit };
};

interface removeUnitResult {
  unit: any;
}

interface removeUnitParams {
  _id: string;
}

export const remove = async (
  payload: removeUnitParams
): Promise<removeUnitResult> => {
  const { _id } = payload;

  if (!_id) {
    throw new Error("Need _ID");
  }

  let unit = await UnitModel.updateOne({ _id }, { $set: { removed: true } });

  if (!unit) {
    throw new Error("unit not removed");
  }

  return { unit };
};
