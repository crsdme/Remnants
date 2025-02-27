import { api } from '@/api/instance';

export type getCategoriesParams = {
  filters?: {
    names: string;
    language: string;
    flat?: boolean;
  };
  // sorters: {
  //   current: number;
  //   pageSize: number;
  // };
  pagination?: {
    current: number;
    pageSize: number;
  };
};

export const getCategories = async (params: getCategoriesParams) =>
  api.get<CategoriesResponse>('categories/get', { params });

export type createCategoriesParams = Category;

export const createCategory = async (params: createCategoriesParams) =>
  api.post<CategoriesResponse>('categories/create', { ...params });

export type editCategoryParams = Category;

export const editCategory = async (params: editCategoryParams) =>
  api.post<CategoriesResponse>('categories/edit', params);

export type removeCategoryParams = {
  _id: string;
};

export const removeCategory = async (params: removeCategoryParams) =>
  api.post<CategoriesResponse>('categories/remove', params);
