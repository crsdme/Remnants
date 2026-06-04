import type { AuditLogDTO } from '@remnant/shared'
import type { AuditLogDB } from '@/types'

export function mapAuditLogAggregateToDTO(row: AuditLogDTO): AuditLogDTO {
  return row
}

export function mapAuditLogDocToDTO(doc: AuditLogDB): AuditLogDTO {
  return {
    id: String(doc._id),
    resourceType: doc.resourceType,
    resourceId: String(doc.resourceId),
    resource: doc.resource ?? null,
    action: doc.action,
    changes: doc.changes ?? [],
    comment: doc.comment ?? '',
    createdAt: doc.createdAt as unknown as Date,
    updatedAt: doc.updatedAt as unknown as Date,
  }
}
