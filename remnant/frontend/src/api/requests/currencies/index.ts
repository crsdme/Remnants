import { api } from '@/api/instance';

export type getCurrenciesParams = {
  filters?: {
    names?: string;
    symbols?: string;
    language: string;
    active?: boolean;
    createdAt?: {
      from?: Date;
      to?: Date;
    };
  };
  sorters?: {
    names?: number;
    priority?: number;
    createdAt?: number;
    updatedAt?: number;
  };
  pagination: {
    full?: boolean;
    current?: number;
    pageSize?: number;
  };
};

export const getCurrencies = async (params: getCurrenciesParams) =>
  api.get<CurrenciesResponse>('currencies/get', { params });

export type createCurrenciesParams = Currency;

export const createCurrency = async (params: createCurrenciesParams) =>
  api.post<CurrenciesResponse>('currencies/create', { ...params });

export type editCurrencyParams = Currency;

export const editCurrency = async (params: editCurrencyParams) =>
  api.post<CurrenciesResponse>('currencies/edit', params);

export type removeCurrencyParams = {
  _id: string;
};

export const removeCurrency = async (params: removeCurrencyParams) =>
  api.post<CurrenciesResponse>('currencies/remove', params);
