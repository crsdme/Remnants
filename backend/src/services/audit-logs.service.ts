import type {
  CreateAuditLogsResponse,
  EditAuditLogsResponse,
  GetAuditLogsResponse,
} from '@remnant/shared'
import type {
  CreateAuditLogsPayload,
  EditAuditLogsPayload,
  GetAuditLogsPayload,
} from '@/types'
import { mapAuditLogDocToDTO } from '@/mappers'
import * as auditLogsRepo from '@/repositories/audit-logs.repo'
import { HttpError } from '@/utils'

export async function get({ payload }: { payload: GetAuditLogsPayload }): Promise<GetAuditLogsResponse> {
  const { items, total, page, pageSize } = await auditLogsRepo.list(payload)

  return {
    status: 'success',
    code: 'AUDIT_LOGS_FETCHED',
    message: 'Audit logs fetched',
    data: {
      items,
      pagination: { total, page, pageSize },
    },
  }
}

export async function create(payload: CreateAuditLogsPayload): Promise<CreateAuditLogsResponse> {
  const doc = await auditLogsRepo.createOne(payload)

  return {
    status: 'success',
    code: 'AUDIT_LOG_CREATED',
    message: 'Audit log created',
    data: mapAuditLogDocToDTO(doc),
  }
}

export async function edit(payload: EditAuditLogsPayload): Promise<EditAuditLogsResponse> {
  const { id } = payload

  const doc = await auditLogsRepo.updateById(id, payload)

  if (!doc) {
    throw new HttpError(400, 'Audit log not edited', 'AUDIT_LOG_NOT_EDITED')
  }

  return {
    status: 'success',
    code: 'AUDIT_LOG_EDITED',
    message: 'Audit log edited',
    data: mapAuditLogDocToDTO(doc),
  }
}
