interface Barcode {
  id: string
  code: string
  products: {
    _id: string
    quantity: number
  }[]
  active: boolean
  createdAt: Date
  updatedAt: Date
}

interface BarcodesResponse {
  status: string
  code: string
  message: string
  description: string
  barcodes: Barcode[]
  barcodesCount: number
}
