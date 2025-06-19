import type PDFDocument from 'pdfkit'
import type { Code, DateRange, IdType, Message, Pagination, Sorter, Status } from './common.type'

export interface Barcode {
  code: string
  products: {
    id: IdType
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

export interface getBarcodesFilters {
  id?: IdType
  code?: string
  products?: IdType[]
  active?: boolean[]
  createdAt?: DateRange
  updatedAt?: DateRange
}

export interface getBarcodesSorters {
  code?: Sorter
  active?: Sorter
  createdAt?: Sorter
  updatedAt?: Sorter
}

export interface getBarcodesParams {
  filters: Partial<getBarcodesFilters>
  sorters: Partial<getBarcodesSorters>
  pagination: Partial<Pagination>
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
    id: IdType
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
  size?: string
  language?: string
}

export interface generateCodeResult {
  status: Status
  code: Code
  message: Message
  barcode: string
}
