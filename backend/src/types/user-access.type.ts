import type {
  CashregisterAccessEntryDTO,
  WarehouseAccessEntryDTO,
} from '@remnant/shared'

export interface UserAccessDB {
  _id: string
  userId: string
  warehouses: WarehouseAccessEntryDTO[]
  cashregisters: CashregisterAccessEntryDTO[]
  siteIds: string[]
  expenseCategoryIds: string[]
  cashregisterAccountIds: string[]
  deliveryServiceIds: string[]
  orderSourceIds: string[]
  orderStatusIds: string[]
  createdAt: Date
  updatedAt: Date
}
