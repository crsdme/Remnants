import type {
  IdType,
  LanguageString,
  Response,
  ResponseItem,
  ResponseList,
} from './common.type'
import type { ProductPropertyOptionDTO } from './product-property-option.type'

export interface ProductDTO {
  id: IdType
  seq: number
  names: LanguageString
  price: number
  currency: IdType
  purchasePrice: number
  purchaseCurrency: IdType
  barcodes: IdType[]
  categories: IdType[]
  unit: IdType
  images: {
    filename: string
    name: string
    type: string
    path: string
  }[]
  productPropertiesGroup: {
    id: IdType
    names: LanguageString
  }
  productProperties: {
    id: IdType
    options: ProductPropertyOptionDTO[]
    value: unknown
  }[]
  quantity: {
    warehouse: IdType
    count: number
  }[]
  removed: boolean
  createdAt: Date
  updatedAt: Date
}

export type GetProductsResponse = ResponseList<ProductDTO>

export type GetProductsIndexResponse = Response & { productIndex: number }

export type CreateProductResponse = ResponseItem<ProductDTO>

export type EditProductResponse = ResponseItem<ProductDTO>

export type RemoveProductsResponse = Response

export type BatchProductsResponse = Response

export type ImportProductsResponse = Response & { productIds: IdType[] }

export type ExportProductsResponse = Response & { buffer: File }

export type DownloadTemplateResponse = Response & { buffer: File }
