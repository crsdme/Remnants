import type { DeliveryLocationDTO } from '@remnant/shared'

interface NpCity {
  Ref?: string
  Description?: string
  DescriptionRu?: string
  AreaDescription?: string
  AreaDescriptionRu?: string
}

interface NpSettlementAddress {
  DeliveryCity?: string
  Present?: string
  MainDescription?: string
  Area?: string
  Ref?: string
}

interface NpWarehouse {
  Ref?: string
  Description?: string
  DescriptionRu?: string
  CityRef?: string
  CategoryOfWarehouse?: string
  TypeOfWarehouse?: string
}

export function mapNpCity(raw: NpCity): DeliveryLocationDTO | null {
  if (!raw.Ref || !raw.Description)
    return null

  const area = raw.AreaDescription ? `, ${raw.AreaDescription}` : ''
  return {
    id: raw.Ref,
    kind: 'city',
    name: `${raw.Description}${area}`,
  }
}

export function mapNpSettlementAddress(raw: NpSettlementAddress): DeliveryLocationDTO | null {
  const id = raw.DeliveryCity || raw.Ref
  if (!id)
    return null

  return {
    id,
    kind: 'city',
    name: raw.Present || raw.MainDescription || id,
  }
}

export function mapNpWarehouse(raw: NpWarehouse, kind: 'office' | 'parcel_locker'): DeliveryLocationDTO | null {
  if (!raw.Ref || !raw.Description)
    return null

  return {
    id: raw.Ref,
    kind,
    name: raw.Description,
    parentId: raw.CityRef,
  }
}

export function isParcelLocker(raw: NpWarehouse): boolean {
  const category = (raw.CategoryOfWarehouse || '').toLowerCase()
  const description = (raw.Description || '').toLowerCase()
  return category.includes('postomat')
    || category.includes('поштомат')
    || description.includes('поштомат')
}
