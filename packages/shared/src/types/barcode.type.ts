import type {
  IdType,
  LanguageString,
  Response,
  ResponseItem,
  ResponseList,
} from './common.type'

export interface BarcodeDTO {
  id: IdType
  code: string
  products: {
    id: IdType
    names: LanguageString
    productProperties: {
      id: IdType
      names: LanguageString
      options: IdType[]
      value: unknown
      optionData: {
        id: IdType
        names: LanguageString
      }[]
    }[]
    categories: {
      id: IdType
      names: LanguageString
    }[]
    quantity: number
    images: {
      id: IdType
      path: string
      filename: string
      name: string
      type: string
    }[]
  }[]
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export type GetBarcodesResponse = ResponseList<BarcodeDTO>

export type CreateBarcodeResponse = ResponseItem<BarcodeDTO>

export type EditBarcodeResponse = ResponseItem<BarcodeDTO>

export type RemoveBarcodesResponse = Response

export type PrintBarcodeResponse<T> = Response & { doc: T }

export type GenerateCodeResponse = ResponseItem<string>
