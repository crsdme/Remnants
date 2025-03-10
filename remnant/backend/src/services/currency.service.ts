import CurrencyModel, { CurrencyInterface } from "../models/currency";
import mongoose, { ObjectId, Schema } from "mongoose";

interface getCurrenciesResult {
  currencies: any[];
  currenciesCount: number;
}

interface getCurrenciesParams {
  filters: {
    names: string;
    symbols: string;
    language: string;
  };
  sorters: {
    names: number;
    priority: number;
    updatedAt: number;
    createdAt: number;
  };
  pagination: {
    current: number;
    pageSize: number;
  };
}

export const get = async (
  payload: getCurrenciesParams
): Promise<getCurrenciesResult> => {
  const { current = 1, pageSize = 10 } = payload.pagination;

  const { names = "", symbols = "", language = "en" } = payload.filters;

  const sorters = payload.sorters;

  let query = { removed: false };

  if (names.trim()) {
    query = {
      ...query,
      [`names.${language}`]: { $regex: names, $options: "i" },
    };
  }

  if (symbols.trim()) {
    query = {
      ...query,
      [`symbols.${language}`]: { $regex: symbols, $options: "i" },
    };
  }

  let pipeline = [
    {
      $match: query,
    },
    ...(sorters && Object.keys(sorters).length > 0
      ? [{ $sort: sorters as Record<string, 1 | -1> }]
      : []),
  ];

  let currenciesCount = await CurrencyModel.countDocuments(query);

  let currenciesQuery = CurrencyModel.aggregate(pipeline);

  currenciesQuery = currenciesQuery
    .skip((current - 1) * pageSize)
    .limit(pageSize);

  const currencies = await currenciesQuery.exec();

  if (!currencies) {
    throw new Error("Currencies not found");
  }

  return { currencies, currenciesCount };
};

interface createCurrencyResult {
  currency: any;
}

interface createCurrencyParams {
  names: object;
  symbols: object;
  priority: number;
  active?: boolean;
}

export const create = async (
  payload: createCurrencyParams
): Promise<createCurrencyResult> => {
  let currency = await CurrencyModel.create(payload);

  if (!currency) {
    throw new Error("Currency not created");
  }

  return { currency };
};

interface editCurrenciesResult {
  currency: any;
}

interface editCurrencyParams {
  _id: string;
  name: string;
  code: string;
  main?: boolean;
  active?: boolean;
}

export const edit = async (
  payload: editCurrencyParams
): Promise<editCurrenciesResult> => {
  const { _id } = payload;

  if (!_id) {
    throw new Error("Need _ID");
  }

  let currency = await CurrencyModel.updateOne({ _id }, payload);

  if (!currency) {
    throw new Error("currency not edited");
  }

  return { currency };
};

interface removeCurrencyResult {
  currency: any;
}

interface removeCurrencyParams {
  _id: string;
}

export const remove = async (
  payload: removeCurrencyParams
): Promise<removeCurrencyResult> => {
  const { _id } = payload;

  if (!_id) {
    throw new Error("Need _ID");
  }

  let currency = await CurrencyModel.updateOne(
    { _id },
    { $set: { removed: true } }
  );

  if (!currency) {
    throw new Error("currency not removed");
  }

  return { currency };
};
