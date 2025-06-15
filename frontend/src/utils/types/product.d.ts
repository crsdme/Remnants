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

interface ProductsResponse {
  status: string
  code: string
  message: string
  description: string
  products: Product[]
  productsCount: number
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

interface ProductPropertiesResponse {
  status: string
  code: string
  message: string
  description: string
  productProperties: ProductProperty[]
  productPropertiesCount: number
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

interface ProductPropertiesOptionsResponse {
  status: string
  code: string
  message: string
  description: string
  productPropertiesOptions: ProductPropertyOption[]
  productPropertiesOptionsCount: number
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

interface ProductPropertiesGroupsResponse {
  status: string
  code: string
  message: string
  description: string
  productPropertyGroups: ProductPropertyGroup[]
  productPropertyGroupsCount: number
}
