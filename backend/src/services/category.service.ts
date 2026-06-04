import type {
  CreateCategoryResponse,
  EditCategoryResponse,
  GetCategoriesResponse,
  RemoveCategoriesResponse,
} from '@remnant/shared'
import type {
  CreateCategoryPayload,
  EditCategoryPayload,
  GetCategoriesPayload,
  RemoveCategoriesPayload,
} from '@/types'
import { mapCategoryToDTO } from '@/mappers/categories.mapper'
import * as categoryRepo from '@/repositories/categories.repo'
import { HttpError } from '@/utils/'

export async function get({ payload }: { payload: GetCategoriesPayload }): Promise<GetCategoriesResponse> {
  const { items, total, page, pageSize } = await categoryRepo.list(payload)

  return {
    status: 'success',
    code: 'CATEGORIES_FETCHED',
    message: 'Categories fetched',
    data: {
      items,
      pagination: {
        page,
        pageSize,
        total,
      },
    },
  }
}

export async function create({ payload }: { payload: CreateCategoryPayload }): Promise<CreateCategoryResponse> {
  const category = await categoryRepo.createOne(payload)

  return {
    status: 'success',
    code: 'CATEGORY_CREATED',
    message: 'Category created',
    data: mapCategoryToDTO(category),
  }
}

export async function edit({ payload }: { payload: EditCategoryPayload }): Promise<EditCategoryResponse> {
  const category = await categoryRepo.updateById(payload.id, payload)

  if (!category) {
    throw new HttpError(400, 'Category not edited', 'CATEGORY_NOT_EDITED')
  }

  return {
    status: 'success',
    code: 'CATEGORY_EDITED',
    message: 'Category edited',
    data: mapCategoryToDTO(category),
  }
}

export async function remove({ payload }: { payload: RemoveCategoriesPayload }): Promise<RemoveCategoriesResponse> {
  for (const id of payload.ids) {
    const category = await categoryRepo.removeById(id)
    if (!category)
      continue
  }

  return {
    status: 'success',
    code: 'CATEGORIES_REMOVED',
    message: 'Categories removed',
  }
}
