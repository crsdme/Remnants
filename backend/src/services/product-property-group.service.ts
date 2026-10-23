import type {
  AuthUser,
  CreateProductPropertyGroupResponse,
  EditProductPropertyGroupResponse,
  GetProductPropertyGroupsResponse,
  RemoveProductPropertyGroupsResponse,
} from '@remnant/shared'
import type {
  CreateProductPropertyGroupPayload,
  EditProductPropertyGroupPayload,
  GetProductPropertyGroupsPayload,
  RemoveProductPropertyGroupPayload,
} from '@/types/'
import { mapProductPropertyGroupToDTO } from '@/mappers/'
import * as ProductPropertyGroupRepo from '@/repositories/product-property-group.repo'
import * as AuditLogsService from '@/services/audit-logs.service'
import { HttpError } from '@/utils/'

export async function get({ payload }: { payload: GetProductPropertyGroupsPayload }): Promise<GetProductPropertyGroupsResponse> {
  const { items, total, page, pageSize } = await ProductPropertyGroupRepo.list(payload)

  return {
    status: 'success',
    code: 'PRODUCT_PROPERTY_GROUPS_FETCHED',
    message: 'Product property groups fetched',
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

export async function create({ payload, user }: { payload: CreateProductPropertyGroupPayload, user?: AuthUser }): Promise<CreateProductPropertyGroupResponse> {
  const item = await ProductPropertyGroupRepo.createOne(payload)

  await AuditLogsService.record({
    resourceType: 'product-property-group',
    resourceId: item._id.toString(),
    action: 'create',
    before: null,
    after: item,
    createdBy: user?.id,
  })

  return {
    status: 'success',
    code: 'PRODUCT_PROPERTY_GROUP_CREATED',
    message: 'Product property group created',
    data: mapProductPropertyGroupToDTO(item.toObject()),
  }
}

export async function edit({ payload, user }: { payload: EditProductPropertyGroupPayload, user?: AuthUser }): Promise<EditProductPropertyGroupResponse> {
  const before = await ProductPropertyGroupRepo.findById(payload.id)
  const item = await ProductPropertyGroupRepo.updateById(payload.id, payload)

  if (item === null)
    throw new HttpError(400, 'Product property group not found', 'PRODUCT_PROPERTY_GROUP_NOT_FOUND')

  await AuditLogsService.record({
    resourceType: 'product-property-group',
    resourceId: item._id.toString(),
    action: 'edit',
    before,
    after: item,
    createdBy: user?.id,
  })

  return {
    status: 'success',
    code: 'PRODUCT_PROPERTY_GROUP_EDITED',
    message: 'Product property group edited',
    data: mapProductPropertyGroupToDTO(item),
  }
}

export async function remove({ payload, user }: { payload: RemoveProductPropertyGroupPayload, user?: AuthUser }): Promise<RemoveProductPropertyGroupsResponse> {
  for (const id of payload.ids) {
    const productPropertyGroups = await ProductPropertyGroupRepo.removeById(id)

    if (!productPropertyGroups)
      throw new HttpError(400, 'Product property groups not removed', 'PRODUCT_PROPERTY_GROUPS_NOT_REMOVED')

    await AuditLogsService.record({
      resourceType: 'product-property-group',
      resourceId: id,
      action: 'remove',
      before: productPropertyGroups,
      after: null,
      createdBy: user?.id,
    })
  }

  return {
    status: 'success',
    code: 'PRODUCT_PROPERTY_GROUPS_REMOVED',
    message: 'Product property groups removed',
  }
}
