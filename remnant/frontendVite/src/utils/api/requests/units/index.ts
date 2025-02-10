import { api } from '@/utils/api/instance';

export type getUnitsParams = {
  // filters: {
  //   current: number;
  //   pageSize: number;
  // };
  // sorters: {
  //   current: number;
  //   pageSize: number;
  // };
  pagination: {
    current?: number;
    pageSize: number;
  };
};

export const getUnits = async (params: getUnitsParams) =>
  api.get<UnitsResponse>('units/get', { params });

export type createUnitsParams = Unit;

export const createUnit = async (params: createUnitsParams) =>
  api.post<UnitsResponse>('units/create', { ...params });

export type editUnitParams = Unit;

export const editUnit = async (params: editUnitParams) =>
  api.post<UnitsResponse>('units/edit', params);

export type removeUnitParams = {
  _id: string;
};

export const removeUnit = async (params: removeUnitParams) =>
  api.post<UnitsResponse>('units/remove', params);
