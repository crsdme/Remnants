import { api } from '@/utils/api/instance';

export type getLanguagesParams = {
  // filters: {
  //   current: number;
  //   pageSize: number;
  // };
  // sorters: {
  //   current: number;
  //   pageSize: number;
  // };
  pagination: {
    current: number;
    pageSize: number;
  };
};

export const getLanguages = async (params) =>
  api.get<LanguagesResponse>('languages/get', { params });

export type createLanguagesParams = Language;

export const createLanguage = async (params: createLanguagesParams) =>
  api.post<LanguagesResponse>('languages/create', { ...params });

export type editLanguageParams = Language;

export const editLanguage = async (params: editLanguageParams) =>
  api.post<LanguagesResponse>('languages/edit', params);

export type removeLanguageParams = {
  _id: string;
};

export const removeLanguage = async (params: removeLanguageParams) =>
  api.post<LanguagesResponse>('languages/remove', params);
