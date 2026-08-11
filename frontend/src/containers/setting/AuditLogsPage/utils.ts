import type { AuditLogPopulatedDTO } from '@remnant/shared'

type ResourceWithMeta = {
  seq?: number | string
  names?: Record<string, string>
} | null

export function getAuditLogEntityPath(auditLog: AuditLogPopulatedDTO): string | null {
  const resource = auditLog.resource as ResourceWithMeta

  switch (auditLog.resourceType) {
    case 'order':
      return resource?.seq != null ? `/orders/view/${resource.seq}` : null
    case 'barcode':
      return auditLog.resourceId ? `/barcodes/edit/${auditLog.resourceId}` : null
    case 'product': {
      const name = resource?.names?.ru || resource?.names?.en
      return name ? `/products?search=${encodeURIComponent(name)}` : null
    }
    case 'warehouse-transaction':
      return resource?.seq != null ? `/warehouse-transactions/receive/${resource.seq}` : null
    default:
      return null
  }
}
