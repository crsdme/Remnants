import type {
  CreateProductPropertyOptionResponse,
  EditProductPropertyOptionResponse,
  GetProductPropertyOptionsResponse,
  RemoveProductPropertyOptionsResponse,
} from '@remnant/shared'
import type {
  CreateProductPropertyOptionPayload,
  EditProductPropertyOptionPayload,
  GetProductPropertyOptionsPayload,
  RemoveProductPropertyOptionsPayload,
} from '@/types'
import { mapProductPropertyOptionToDTO } from '@/mappers/'
import * as ProductPropertyOptionRepo from '@/repositories/product-property-option.repo'
import * as ProductPropertyRepo from '@/repositories/product-property.repo'
import { HttpError } from '@/utils/'

export async function get({ payload }: { payload: GetProductPropertyOptionsPayload }): Promise<GetProductPropertyOptionsResponse> {
  const { items, total, page, pageSize } = await ProductPropertyOptionRepo.list(payload)

  return {
    status: 'success',
    code: 'PRODUCT_PROPERTY_OPTIONS_FETCHED',
    message: 'Product property options fetched',
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

export async function create({ payload }: { payload: CreateProductPropertyOptionPayload }): Promise<CreateProductPropertyOptionResponse> {
  const productPropertyOption = await ProductPropertyOptionRepo.createOne(payload)

  if (productPropertyOption === null)
    throw new HttpError(400, 'Product property option not created', 'PRODUCT_PROPERTY_OPTION_NOT_CREATED')

  await ProductPropertyRepo.updateOptions(payload.productPropertyId, { $push: { optionIds: productPropertyOption._id } })

  return {
    status: 'success',
    code: 'PRODUCT_PROPERTY_OPTION_CREATED',
    message: 'Product property option created',
    data: mapProductPropertyOptionToDTO(productPropertyOption),
  }
}

export async function edit({ payload }: { payload: EditProductPropertyOptionPayload }): Promise<EditProductPropertyOptionResponse> {
  const productPropertyOption = await ProductPropertyOptionRepo.updateById(payload.id, payload)

  if (productPropertyOption === null)
    throw new HttpError(400, 'Product property option not edited', 'PRODUCT_PROPERTY_OPTION_NOT_EDITED')

  return {
    status: 'success',
    code: 'PRODUCT_PROPERTY_OPTION_EDITED',
    message: 'Product property option edited',
    data: mapProductPropertyOptionToDTO(productPropertyOption),
  }
}

export async function remove({ payload }: { payload: RemoveProductPropertyOptionsPayload }): Promise<RemoveProductPropertyOptionsResponse> {
  for (const id of payload.ids) {
    const productPropertyOption = await ProductPropertyOptionRepo.removeById(id)

    if (productPropertyOption === null)
      throw new HttpError(400, 'Product property option not removed', 'PRODUCT_PROPERTY_OPTION_NOT_REMOVED')

    await ProductPropertyRepo.updateOptions(productPropertyOption.productPropertyId, { $pull: { optionIds: id } })
  }

  return {
    status: 'success',
    code: 'PRODUCT_PROPERTY_OPTIONS_REMOVED',
    message: 'Product property options removed',
  }
}
