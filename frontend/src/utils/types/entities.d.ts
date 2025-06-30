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
  isMultiple: boolean
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
