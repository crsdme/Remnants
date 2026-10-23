import type {
  AuthUser,
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
import * as AuditLogsService from '@/services/audit-logs.service'
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

export async function create({ payload, user }: { payload: CreateCategoryPayload, user?: AuthUser }): Promise<CreateCategoryResponse> {
  const category = await categoryRepo.createOne(payload)

  await AuditLogsService.record({
    resourceType: 'category',
    resourceId: category._id.toString(),
    action: 'create',
    before: null,
    after: category,
    createdBy: user?.id,
  })

  return {
    status: 'success',
    code: 'CATEGORY_CREATED',
    message: 'Category created',
    data: mapCategoryToDTO(category),
  }
}

export async function edit({ payload, user }: { payload: EditCategoryPayload, user?: AuthUser }): Promise<EditCategoryResponse> {
  const before = await categoryRepo.findById(payload.id)
  const category = await categoryRepo.updateById(payload.id, payload)

  if (!category) {
    throw new HttpError(400, 'Category not edited', 'CATEGORY_NOT_EDITED')
  }

  await AuditLogsService.record({
    resourceType: 'category',
    resourceId: category._id.toString(),
    action: 'edit',
    before,
    after: category,
    createdBy: user?.id,
  })

  return {
    status: 'success',
    code: 'CATEGORY_EDITED',
    message: 'Category edited',
    data: mapCategoryToDTO(category),
  }
}

export async function remove({ payload, user }: { payload: RemoveCategoriesPayload, user?: AuthUser }): Promise<RemoveCategoriesResponse> {
  for (const id of payload.ids) {
    const category = await categoryRepo.removeById(id)
    if (!category)
      continue

    await AuditLogsService.record({
      resourceType: 'category',
      resourceId: id,
      action: 'remove',
      before: category,
      after: null,
      createdBy: user?.id,
    })
  }

  return {
    status: 'success',
    code: 'CATEGORIES_REMOVED',
    message: 'Categories removed',
  }
}
