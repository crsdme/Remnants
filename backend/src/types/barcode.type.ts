import type PDFDocument from 'pdfkit'
import type { Code, DateRange, IdType, Message, Pagination, Status } from './common.type'

export interface Barcode {
  code: string
  products: {
    _id: IdType
    quantity: number
  }[]
  active: boolean
  removed: boolean
  createdAt: Date
  updatedAt: Date
}

export interface getBarcodesResult {
  status: Status
  code: Code
  message: Message
  barcodes: Barcode[]
  barcodesCount: number
}

export interface getBarcodesParams {
  filters: {
    id?: IdType
    code?: string
    active?: boolean[]
    products?: IdType[]
    createdAt?: DateRange
    updatedAt?: DateRange
  }
  sorters: {
    code?: string
    active?: string
    updatedAt?: string
    createdAt?: string
  }
  pagination: Pagination
}

export interface createBarcodeResult {
  status: Status
  code: Code
  message: Message
  barcode: Barcode
}

export interface createBarcodeParams {
  code?: string
  products: {
    id: IdType
    quantity: number
  }[]
  active?: boolean
}

export interface editBarcodeResult {
  status: Status
  code: Code
  message: Message
  barcode: Barcode
}

export interface editBarcodeParams {
  id: IdType
  code: string
  products: {
    _id: IdType
    quantity: number
  }[]
  active?: boolean
}

export interface removeBarcodesResult {
  status: Status
  code: Code
  message: Message
}

export interface removeBarcodesParams {
  ids: IdType[]
}

export interface printBarcodeResult {
  status: Status
  code: Code
  message: Message
  doc: typeof PDFDocument
}

export interface printBarcodeParams {
  id: IdType
  size: string
  language: string
}

export interface generateCodeResult {
  status: Status
  code: Code
  message: Message
  barcode: string
}
