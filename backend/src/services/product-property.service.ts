import type {
  AuthUser,
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
import * as AuditLogsService from '@/services/audit-logs.service'
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

export async function create({ payload, user }: { payload: CreateProductPropertyPayload, user?: AuthUser }): Promise<CreateProductPropertyResponse> {
  const productProperty = await ProductPropertyRepo.createOne(payload)

  await AuditLogsService.record({
    resourceType: 'product-property',
    resourceId: productProperty._id.toString(),
    action: 'create',
    before: null,
    after: productProperty,
    createdBy: user?.id,
  })

  return {
    status: 'success',
    code: 'PRODUCT_PROPERTY_CREATED',
    message: 'Product property created',
    data: mapProductPropertyToDTO(productProperty),
  }
}

export async function edit({ payload, user }: { payload: EditProductPropertyPayload, user?: AuthUser }): Promise<EditProductPropertyResponse> {
  const { id } = payload
  const before = await ProductPropertyRepo.findById(id)
  const productProperty = await ProductPropertyRepo.updateById(id, payload)

  if (productProperty === null) {
    throw new HttpError(400, 'Product property not edited', 'PRODUCT_PROPERTY_NOT_EDITED')
  }

  await AuditLogsService.record({
    resourceType: 'product-property',
    resourceId: productProperty._id.toString(),
    action: 'edit',
    before,
    after: productProperty,
    createdBy: user?.id,
  })

  return {
    status: 'success',
    code: 'PRODUCT_PROPERTY_EDITED',
    message: 'Product property edited',
    data: mapProductPropertyToDTO(productProperty),
  }
}

export async function remove({ payload, user }: { payload: RemoveProductPropertiesPayload, user?: AuthUser }): Promise<RemoveProductPropertiesResponse> {
  for (const id of payload.ids) {
    const productProperty = await ProductPropertyRepo.removeById(id)

    if (!productProperty)
      throw new HttpError(400, 'Product properties not removed', 'PRODUCT_PROPERTIES_NOT_REMOVED')

    await AuditLogsService.record({
      resourceType: 'product-property',
      resourceId: id,
      action: 'remove',
      before: productProperty,
      after: null,
      createdBy: user?.id,
    })
  }

  return {
    status: 'success',
    code: 'PRODUCT_PROPERTIES_REMOVED',
    message: 'Product properties removed',
  }
}
