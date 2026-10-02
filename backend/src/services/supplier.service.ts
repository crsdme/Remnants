import type {
  CreateSupplierResponse,
  EditSupplierResponse,
  GetSuppliersResponse,
  RemoveSuppliersResponse,
} from '@remnant/shared'
import type {
  CreateSupplierPayload,
  EditSupplierPayload,
  GetSuppliersPayload,
  RemoveSuppliersPayload,
} from '@/types'
import { mapSupplierToDTO } from '@/mappers/'
import * as SupplierRepo from '@/repositories/supplier.repo'
import * as Settlement from '@/services/settlement.service'
import { HttpError } from '@/utils/'

export async function get({ payload }: { payload: GetSuppliersPayload }): Promise<GetSuppliersResponse> {
  const { items, total, page, pageSize } = await SupplierRepo.list(payload)
  const withSettlement = await Settlement.withSettlement(items)

  return {
    status: 'success',
    code: 'SUPPLIERS_FETCHED',
    message: 'Suppliers fetched',
    data: {
      items: withSettlement,
      pagination: {
        page,
        pageSize,
        total,
      },
    },
  }
}

export async function create({ payload }: { payload: CreateSupplierPayload }): Promise<CreateSupplierResponse> {
  const supplier = await SupplierRepo.createOne(payload)
  const [item] = await Settlement.withSettlement([mapSupplierToDTO(supplier)])

  return {
    status: 'success',
    code: 'SUPPLIER_CREATED',
    message: 'Supplier created',
    data: item,
  }
}

export async function edit({ payload }: { payload: EditSupplierPayload }): Promise<EditSupplierResponse> {
  const supplier = await SupplierRepo.updateById(payload.id, payload)

  if (!supplier)
    throw new HttpError(400, 'Supplier not edited', 'SUPPLIER_NOT_EDITED')

  const [item] = await Settlement.withSettlement([mapSupplierToDTO(supplier)])

  return {
    status: 'success',
    code: 'SUPPLIER_EDITED',
    message: 'Supplier edited',
    data: item,
  }
}

export async function remove({ payload }: { payload: RemoveSuppliersPayload }): Promise<RemoveSuppliersResponse> {
  for (const id of payload.ids)
    await SupplierRepo.removeById(id)

  return {
    status: 'success',
    code: 'SUPPLIERS_REMOVED',
    message: 'Suppliers removed',
  }
}
