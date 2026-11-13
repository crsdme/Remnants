import type {
  AuthUser,
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
import * as AuditLogsService from '@/services/audit-logs.service'
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

export async function create({ payload, user }: { payload: CreateSupplierPayload, user?: AuthUser }): Promise<CreateSupplierResponse> {
  const supplier = await SupplierRepo.createOne(payload)

  await AuditLogsService.record({
    resourceType: 'supplier',
    resourceId: supplier._id.toString(),
    action: 'create',
    before: null,
    after: supplier,
    createdBy: user?.id,
  })

  const [item] = await Settlement.withSettlement([mapSupplierToDTO(supplier)])

  return {
    status: 'success',
    code: 'SUPPLIER_CREATED',
    message: 'Supplier created',
    data: item,
  }
}

export async function edit({ payload, user }: { payload: EditSupplierPayload, user?: AuthUser }): Promise<EditSupplierResponse> {
  const before = await SupplierRepo.findById(payload.id)
  const supplier = await SupplierRepo.updateById(payload.id, payload)

  if (!supplier)
    throw new HttpError(400, 'Supplier not edited', 'SUPPLIER_NOT_EDITED')

  await AuditLogsService.record({
    resourceType: 'supplier',
    resourceId: supplier._id.toString(),
    action: 'edit',
    before,
    after: supplier,
    createdBy: user?.id,
  })

  const [item] = await Settlement.withSettlement([mapSupplierToDTO(supplier)])

  return {
    status: 'success',
    code: 'SUPPLIER_EDITED',
    message: 'Supplier edited',
    data: item,
  }
}

export async function remove({ payload, user }: { payload: RemoveSuppliersPayload, user?: AuthUser }): Promise<RemoveSuppliersResponse> {
  for (const id of payload.ids) {
    const supplier = await SupplierRepo.removeById(id)

    if (!supplier)
      continue

    await AuditLogsService.record({
      resourceType: 'supplier',
      resourceId: id,
      action: 'remove',
      before: supplier,
      after: null,
      createdBy: user?.id,
    })
  }

  return {
    status: 'success',
    code: 'SUPPLIERS_REMOVED',
    message: 'Suppliers removed',
  }
}
