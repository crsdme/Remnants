export interface UserAccessDB {
  _id: string
  userId: string
  warehouseIds: string[]
  siteIds: string[]
  expenseCategoryIds: string[]
  cashregisterIds: string[]
  cashregisterAccountIds: string[]
  deliveryServiceIds: string[]
  orderSourceIds: string[]
  orderStatusIds: string[]
  createdAt: Date
  updatedAt: Date
}
