import LanguageModel, { LanguageInterface } from "../models/language";
import mongoose, { ObjectId, Schema } from "mongoose";

interface getLanguagesResult {
  languages: any[];
  languagesCount: number;
}

interface getLanguagesParams {
  filters: any[];
  sorters: any[];
  pagination: {
    current: number;
    pageSize: number;
  };
}

export const get = async (
  payload: getLanguagesParams
): Promise<getLanguagesResult> => {
  const { current = 1, pageSize = 10 } = payload.pagination;

  let query = { removed: false };

  let pipline = [
    {
      $match: query,
    },
  ];

  let languagesCount = await LanguageModel.countDocuments(query);

  let languagesQuery = LanguageModel.aggregate(pipline);

  languagesQuery = languagesQuery
    .skip((current - 1) * pageSize)
    .limit(pageSize);

  const languages = await languagesQuery.exec();

  if (!languages) {
    throw new Error("Products not found");
  }

  return { languages, languagesCount };
};

interface createLanguagesResult {
  language: any;
}

interface createLanguageParams {
  name: string;
  code: string;
  main?: boolean;
  active?: boolean;
}

export const create = async (
  payload: createLanguageParams
): Promise<createLanguagesResult> => {
  let language = await LanguageModel.create(payload);

  if (!language) {
    throw new Error("Language not created");
  }

  return { language };
};

interface editLanguagesResult {
  language: any;
}

interface editLanguageParams {
  _id: string;
  name: string;
  code: string;
  main?: boolean;
  active?: boolean;
}

export const edit = async (
  payload: editLanguageParams
): Promise<editLanguagesResult> => {
  const { _id } = payload;

  if (!_id) {
    throw new Error("Need _ID");
  }

  let language = await LanguageModel.updateOne({ _id }, payload);

  if (!language) {
    throw new Error("Language not edited");
  }

  return { language };
};

interface editLanguagesResult {
  language: any;
}

interface removeLanguageParams {
  _id: string;
}

export const remove = async (
  payload: removeLanguageParams
): Promise<editLanguagesResult> => {
  const { _id } = payload;

  if (!_id) {
    throw new Error("Need _ID");
  }

  let language = await LanguageModel.updateOne(
    { _id },
    { $set: { removed: true } }
  );

  if (!language) {
    throw new Error("Language not removed");
  }

  return { language };
};
