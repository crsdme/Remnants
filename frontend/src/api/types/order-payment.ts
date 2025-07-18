export interface getOrderPaymentsParams {
  filters: {
    order?: string
    cashregister?: string
    cashregisterAccount?: string
    paymentStatus?: string
    paymentDate?: Date
  }
  sorters?: {
    paymentDate?: string
    updatedAt?: string
    createdAt?: string
  }
  pagination?: {
    full?: boolean
    current?: number
    pageSize?: number
  }
}

export interface createOrderPaymentParams {
  order: string
  cashregister: string
  cashregisterAccount: string
  amount: number
  currency: string
  paymentStatus: string
  paymentDate: Date
  comment: string
}

export interface OrderPaymentResponse {
  status: string
  code: string
  message: string
  description: string
  orderPayment: OrderPayment
  orderPaymentCount: number
}

export interface editOrderPaymentParams {
  id: string
  order: string
  cashregister: string
  cashregisterAccount: string
  amount: number
  currency: string
  paymentStatus: string
  paymentDate: Date
  comment: string
}

export interface removeOrderPaymentsParams {
  ids: string[]
}
