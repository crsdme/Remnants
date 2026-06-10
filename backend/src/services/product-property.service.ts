import type {
  CreateProductPropertyResponse,
  EditProductPropertyResponse,
  GetProductPropertiesResponse,
  RemoveProductPropertiesResponse,
} from '@remnant/shared'
import type {
  CreateProductPropertyPayload,
  EditProductPropertyPayload,
  GetProductPropertiesPayload,
  RemoveProductPropertiesPayload,
} from '@/types/'
import { mapProductPropertyToDTO } from '@/mappers/'
import * as ProductPropertyRepo from '@/repositories/product-property.repo'
import { HttpError } from '@/utils/'

export async function get({ payload }: { payload: GetProductPropertiesPayload }): Promise<GetProductPropertiesResponse> {
  const { items, total, page, pageSize } = await ProductPropertyRepo.list(payload)

  return {
    status: 'success',
    code: 'PRODUCT_PROPERTIES_FETCHED',
    message: 'Product properties fetched',
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

export async function create({ payload }: { payload: CreateProductPropertyPayload }): Promise<CreateProductPropertyResponse> {
  const productProperty = await ProductPropertyRepo.createOne(payload)

  return {
    status: 'success',
    code: 'PRODUCT_PROPERTY_CREATED',
    message: 'Product property created',
    data: mapProductPropertyToDTO(productProperty),
  }
}

export async function edit({ payload }: { payload: EditProductPropertyPayload }): Promise<EditProductPropertyResponse> {
  const { id } = payload

  const productProperty = await ProductPropertyRepo.updateById(id, payload)

  if (productProperty === null) {
    throw new HttpError(400, 'Product property not edited', 'PRODUCT_PROPERTY_NOT_EDITED')
  }

  return {
    status: 'success',
    code: 'PRODUCT_PROPERTY_EDITED',
    message: 'Product property edited',
    data: mapProductPropertyToDTO(productProperty),
  }
}

export async function remove({ payload }: { payload: RemoveProductPropertiesPayload }): Promise<RemoveProductPropertiesResponse> {
  for (const id of payload.ids) {
    const productProperty = await ProductPropertyRepo.removeById(id)

    if (!productProperty)
      throw new HttpError(400, 'Product properties not removed', 'PRODUCT_PROPERTIES_NOT_REMOVED')
  }

  return {
    status: 'success',
    code: 'PRODUCT_PROPERTIES_REMOVED',
    message: 'Product properties removed',
  }
}
