import type { Buffer } from 'node:buffer'
import type { SUPPORTED_LANGUAGES_TYPE } from '../config/constants'
import type { Code, DateRange, IdType, LanguageString, Message, Pagination, Status } from './common.type'

export interface Product {
  names: Map<string, string>
  price: number
  currency: IdType
  purchasePrice: number
  purchaseCurrency: IdType
  barcodes: IdType[]
  categories: IdType[]
  unit: IdType
  images: {
    filename: string
    originalname: string
    mimetype: string
    path: string
  }[]
  productPropertiesGroup: {
    id: IdType
  }
  productProperties: {
    id: IdType
    options: {
      id: IdType
      name: string
    }[]
  }[]
  removed: boolean
  createdAt: Date
  updatedAt: Date
}

export interface getProductsResult {
  status: Status
  code: Code
  message: Message
  products: Product[]
  productsCount: number
}

export interface getProductsParams {
  filters: {
    names: LanguageString
    language: SUPPORTED_LANGUAGES_TYPE
    price: number
    purchasePrice: number
    barcodes: string[]
    categories: IdType[]
    unit: IdType
    productPropertiesGroup: IdType
    productProperties: IdType[]
    createdAt: DateRange
    updatedAt: DateRange
  }
  sorters: {
    names: string
    price: string
    purchasePrice: string
    barcodes: string
    categories: string
    unit: string
    productPropertiesGroup: string
    productProperties: string
    createdAt: string
    updatedAt: string
  }
  pagination: Pagination
  isTree: boolean
}

export interface createProductResult {
  status: Status
  code: Code
  message: Message
  product: Product
}

export interface createProductParams {
  names: LanguageString
  price: number
  currency: IdType
  purchasePrice: number
  purchaseCurrency: IdType
  categories: IdType[]
  unit: IdType
  productPropertiesGroup: IdType
  productProperties: {
    id: IdType
    value: IdType[]
  }[]
  images: {
    filename: string
    originalname: string
    mimetype: string
    path: string
  }[]
  uploadedImages: {
    filename: string
    originalname: string
    mimetype: string
    path: string
  }[]
}

export interface editProductResult {
  status: Status
  code: Code
  message: Message
  product: Product
}

export interface editProductParams {
  id: IdType
  names: LanguageString
  price: number
  currency: IdType
  purchasePrice: number
  purchaseCurrency: IdType
  categories: IdType[]
  unit: IdType
  productPropertiesGroup: IdType
  productProperties: {
    id: IdType
    value: IdType[]
  }[]
  images: {
    filename: string
    originalname: string
    mimetype: string
    path: string
  }[]
  uploadedImages: {
    filename: string
    originalname: string
    mimetype: string
    path: string
  }[]
  uploadedImagesIds: IdType[]
}

export interface removeProductsResult {
  status: Status
  code: Code
  message: Message
}

export interface removeProductsParams {
  ids: IdType[]
}

export interface batchProductsResult {
  status: Status
  code: Code
  message: Message
}

export interface batchProductsParams {
  ids: IdType[]
  filters: {
    names: LanguageString
    language: SUPPORTED_LANGUAGES_TYPE
    price: number
    purchasePrice: number
    barcodes: string[]
    categories: IdType[]
    unit: IdType
    productPropertiesGroup: IdType
    productProperties: IdType[]
    createdAt: DateRange
    updatedAt: DateRange
  }
  params: {
    column: string
    value: string | number | boolean | Record<string, string>
  }[]
}

export interface importProductsResult {
  status: Status
  code: Code
  message: Message
  productIds: IdType[]
}

export interface importProductsParams {
  file: Express.Multer.File
}

export interface duplicateProductResult {
  status: Status
  code: Code
  message: Message
}

export interface duplicateProductParams {
  ids: IdType[]
}

export interface exportProductsResult {
  status: Status
  code: Code
  message: Message
  buffer: Buffer
}

export interface exportProductsParams {
  ids?: IdType[]
}
