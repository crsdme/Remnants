import type { SiteDTO } from '@remnant/shared'
import type { SiteDB } from '@/types'

export function mapSiteToDTO(site: SiteDB): SiteDTO {
  return {
    id: site._id,
    names: site.names,
    url: site.url,
    key: site.key,
    priority: site.priority,
    active: site.active,
    warehouses: site.warehouses,
    createdAt: site.createdAt,
    updatedAt: site.updatedAt,
  }
}
