interface Barcode {
  id: string
  code: string
  products: {
    id: string
    quantity: number
  }[]
  active: boolean
  createdAt: Date
  updatedAt: Date
}

interface Category {
  id: string
  names: LanguageString
  priority: number
  parent: string
  active: boolean
  children: Category[]
  createdAt: Date
  updatedAt: Date
}

interface Currency {
  id: string
  names: LanguageString
  symbols: LanguageString
  active: boolean
  priority: number
  disabled: boolean
  createdAt: Date
  updatedAt: Date
}

interface Language {
  id: string
  name: string
  code: string
  main: boolean
  priority: number
  active: boolean
  createdAt: Date
  updatedAt: Date
}

interface Product {
  id: string
  names: LanguageString
  priority: number
  parent: string
  active: boolean
  children: Product[]
  createdAt: Date
  updatedAt: Date
}

interface ProductProperty {
  id: string
  names: LanguageString
  priority: number
  type: string
  active: boolean
  createdAt: Date
  updatedAt: Date
}

interface ProductPropertyOption {
  id: string
  names: LanguageString
  priority: number
  active: boolean
  color: string
  createdAt: Date
  updatedAt: Date
}

interface ProductPropertyGroup {
  id: string
  names: LanguageString
  priority: number
  productProperties: ProductProperty[]
  active: boolean
  createdAt: Date
  updatedAt: Date
}

interface Unit {
  id: string
  names: LanguageString
  symbols: LanguageString
  active: boolean
  priority: number
  createdAt: Date
  updatedAt: Date
}

interface User {
  id: string
  name: string
  login: string
  password?: string
  active: boolean
  role: any
  seq: number
  createdAt: Date
  updatedAt: Date
  permissions: string[]
}

interface UserRole {
  id: string
  names: LanguageString
  permissions: string[]
  priority: number
  active: boolean
  createdAt: Date
  updatedAt: Date
}

interface Warehouse {
  id: string
  names: LanguageString
  active: boolean
  priority: number
  createdAt: Date
  updatedAt: Date
}

interface Cashregister {
  id: string
  names: LanguageString
  active: boolean
  priority: number
  createdAt: Date
  updatedAt: Date
}

interface CashregisterAccount {
  id: string
  seq: number
  names: LanguageString
  active: boolean
  priority: number
  createdAt: Date
  updatedAt: Date
}

interface MoneyTransaction {
  id: string
  type: string
  direction: string
  accountId: string
  amount: number
  currency: string
  sourceModel: string
  sourceId: string
  createdAt: Date
  updatedAt: Date
}

interface Setting {
  id: string
  key: string
  value: string
  description: string
  scope: string
  createdAt: Date
  updatedAt: Date
}

interface WarehouseTransaction {
  id: string
  type: string
  sourceWarehouseId: string
  destinationWarehouseId: string
  requiresReceiving: boolean
  status: string
  createdBy: string
  comment: string
  createdAt: Date
  updatedAt: Date
}

interface WarehouseTransactionItem {
  id: string
  transactionId: string
  productId: string
  product: Product
  quantity: number
  createdAt: Date
  updatedAt: Date
}

interface OrderStatus {
  id: string
  names: LanguageString
  priority: number
  color: string
  createdAt: Date
  updatedAt: Date
}

interface OrderSource {
  id: string
  names: LanguageString
  priority: number
  color: string
  createdAt: Date
  updatedAt: Date
}

interface DeliveryService {
  id: string
  names: LanguageString
  priority: number
  color: string
  type: 'novaposhta' | 'selfpickup'
  createdAt: Date
  updatedAt: Date
}

interface Client {
  id: string
  name: string
  middleName: string
  lastName: string
  emails: string[]
  phones: string[]
  addresses: string[]
}

interface Order {
  id: string
  warehouse: string
  deliveryService: string
  orderSource: string
  orderStatus: string
  orderPayments: string
  client: string
  comment: string
  items: OrderItem[]
  createdAt: Date
  updatedAt: Date
}

interface OrderItem {
  id: string
  order: string
  product: string
  quantity: number
  price: number
  currency: string
  discountAmount: number
  discountPercent: number
}

interface OrderPayment {
  id: string
  order: string
  cashregister: string
  cashregisterAccount: string
  amount: number
  currency: string
  paymentStatus: string
  paymentDate: Date
  comment: string
  createdAt: Date
  updatedAt: Date
}

interface Automation {
  id: string
  name: string
  trigger: string
  conditions: string[]
  actions: string[]
  createdAt: Date
  updatedAt: Date
}

interface ExchangeRate {
  id: string
  fromCurrency: Currency
  toCurrency: Currency
  rate: number
  comment: string
  createdAt: Date
  updatedAt: Date
}

interface Expense {
  id: string
  seq: number
  amount: number
  currency: string
  cashregister: string
  cashregisterAccount: string
  categories: string[]
  sourceModel: string
  sourceId: string
  type: string
  comment: string
  createdBy: string
  removedBy: string
  createdAt: Date
  updatedAt: Date
}

interface ExpenseCategory {
  id: string
  names: LanguageString
  color: string
  comment: string
  createdAt: Date
  updatedAt: Date
}

interface Site {
  id: string
  names: LanguageString
  url: string
  key: string
  priority: number
  createdAt: Date
  updatedAt: Date
}

interface Inventory {
  id: string
  status: string
  warehouse: string
  createdBy: string
  comment: string
  createdAt: Date
  updatedAt: Date
}

interface InventoryItem {
  id: string
  inventoryId: string
  productId: string
  product: Product
  quantity: number
  receivedQuantity: number
  createdAt: Date
  updatedAt: Date
}
