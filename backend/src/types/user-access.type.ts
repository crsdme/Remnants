export interface UserAccessDB {
  _id: string
  userId: string
  warehouses: string[]
  sites: string[]
  expenseCategories: string[]
  cashregisters: string[]
  cashregisterAccounts: string[]
  deliveryServices: string[]
  orderSources: string[]
  orderStatuses: string[]
  createdAt: Date
  updatedAt: Date
}
