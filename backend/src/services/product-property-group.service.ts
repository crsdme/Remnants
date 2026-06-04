import type {
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

export async function create({ payload }: { payload: CreateProductPropertyGroupPayload }): Promise<CreateProductPropertyGroupResponse> {
  const item = await ProductPropertyGroupRepo.createOne(payload)

  return {
    status: 'success',
    code: 'PRODUCT_PROPERTY_GROUP_CREATED',
    message: 'Product property group created',
    data: mapProductPropertyGroupToDTO(item.toObject()),
  }
}

export async function edit({ payload }: { payload: EditProductPropertyGroupPayload }): Promise<EditProductPropertyGroupResponse> {
  const item = await ProductPropertyGroupRepo.updateById(payload.id, payload)

  if (item === null)
    throw new HttpError(400, 'Product property group not found', 'PRODUCT_PROPERTY_GROUP_NOT_FOUND')

  return {
    status: 'success',
    code: 'PRODUCT_PROPERTY_GROUP_EDITED',
    message: 'Product property group edited',
    data: mapProductPropertyGroupToDTO(item),
  }
}

export async function remove({ payload }: { payload: RemoveProductPropertyGroupPayload }): Promise<RemoveProductPropertyGroupsResponse> {
  for (const id of payload.ids) {
    const productPropertyGroups = await ProductPropertyGroupRepo.removeById(id)

    if (!productPropertyGroups)
      throw new HttpError(400, 'Product property groups not removed', 'PRODUCT_PROPERTY_GROUPS_NOT_REMOVED')
  }

  return {
    status: 'success',
    code: 'PRODUCT_PROPERTY_GROUPS_REMOVED',
    message: 'Product property groups removed',
  }
}
