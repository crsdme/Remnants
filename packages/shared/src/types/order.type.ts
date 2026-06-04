import type {
  IdType,
  Response,
  ResponseItem,
  ResponseList,
} from './common.type'
import type { CurrencyDTO } from './currency.type'
import type { OrderPaymentDTO } from './order-payment.type'
import type { ProductDTO } from './product.type'

export interface OrderDTO {
  id: IdType
  seq: number
  warehouse: string
  deliveryService: string
  orderSource: string
  orderStatus: string
  orderPayments: OrderPaymentDTO[]
  totals: {
    currency: IdType
    total: number
  }[]
  client: IdType
  comment: string
  createdBy: string
  confirmedBy: string
  removedBy: string
  removed: boolean
  createdAt: Date
  updatedAt: Date
}

export interface OrderItemDTO {
  _id?: IdType
  id?: IdType
  order: IdType
  product: ProductDTO
  quantity: number
  price: number
  discountAmount: number
  discountPercent: number
  basePrice: number
  manualPrice: number
  currency: CurrencyDTO
  removedBy: string
  removed: boolean
  profit: number
  exchangeRate: number
  purchasePrice: number
  purchaseCurrency: string
}

export type GetOrdersResponse = ResponseList<OrderDTO>

export type CreateOrderResponse = ResponseItem<OrderDTO>

export type EditOrderResponse = ResponseItem<OrderDTO>

export type RemoveOrdersResponse = Response

export type GetOrderItemsResponse = ResponseList<OrderItemDTO>

export type PayOrderResponse = Response

export type PrintInvoiceOrderResponse = Response & { doc: any }

export type PrintDraftInvoiceOrderResponse = Response & { doc: any }

export type PrintOrderLabelResponse = Response & { doc: any }
