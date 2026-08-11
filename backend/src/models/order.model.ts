import type { HydratedDocument } from 'mongoose'
import type { OrderDB, OrderItemDB } from '@/types'
import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { CounterModel } from '@/models/'
import { uuidValidator } from '@/utils/'

type OrderDoc = HydratedDocument<OrderDB>

const OrderSchema: Schema = new Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
      validate: uuidValidator,
    },
    seq: {
      type: Number,
      default: 0,
    },
    warehouseId: {
      type: String,
      ref: 'warehouse',
      required: true,
    },
    deliveryServiceId: {
      type: String,
      ref: 'deliveryService',
      required: true,
    },
    orderSourceId: {
      type: String,
      ref: 'orderSource',
      required: true,
    },
    orderStatusId: {
      type: String,
      ref: 'orderStatus',
      required: true,
    },
    orderPaymentIds: [{
      type: String,
      ref: 'orderPayment',
      required: true,
    }],
    orderPaymentStatus: {
      type: String,
      enum: ['paid', 'unpaid', 'partially_paid', 'overpaid'],
      default: 'unpaid',
    },
    clientId: {
      type: String,
      ref: 'client',
    },
    comment: {
      type: String,
      default: '',
    },
    files: [{
      _id: false,
      path: {
        type: String,
        required: true,
      },
      filename: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        required: true,
      },
    }],
    createdBy: {
      type: String,
      ref: 'user',
    },
    confirmedBy: {
      type: String,
      ref: 'user',
    },
    removedBy: {
      type: String,
      ref: 'user',
    },
    removed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

type OrderItemDoc = HydratedDocument<OrderItemDB>

const OrderItemSchema: Schema = new Schema({
  _id: {
    type: String,
    default: uuidv4,
    validate: uuidValidator,
  },
  orderId: {
    type: String,
    required: true,
    ref: 'Order',
  },
  productId: {
    type: String,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  minorManualPrice: { // ЦЕНА КОТОРАЯ БЫЛА ОТРЕДАКТИРОВАНА ВРУЧНУЮ
    type: Number,
  },
  minorBasePrice: { // ЦЕНА ИЗ ТОВАРА
    type: Number,
    required: true,
  },
  minorPrice: { // ЦЕНА ЗА ЕДИНИЦУ ТОВАРА С УЧЕТОМ СКИДКИ И ОТРЕДАКТИРОВАННОЙ ЦЕНЫ
    type: Number,
    required: true,
  },
  minorPurchasePrice: {
    type: Number,
    required: true,
  },
  purchaseCurrencyId: {
    type: String,
    ref: 'Currency',
    required: true,
  },
  minorProfit: { // ПРИБЫЛЬ ЗА ЕДИНИЦУ ТОВАРА
    type: Number,
    required: true,
  },
  currencyId: {
    type: String,
    required: true,
  },
  minorDiscountAmount: {
    type: Number,
    default: 0,
  },
  discountPercent: {
    type: Number,
    default: 0,
  },
  exchangeRate: {
    type: Number,
    default: 1,
  },
  removedBy: {
    type: String,
    ref: 'User',
  },
  createdBy: {
    type: String,
    ref: 'User',
  },
  removed: {
    type: Boolean,
    default: false,
  },
})

OrderSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.removed
  },
})

OrderItemSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.removed
    delete ret.purchasePrice
  },
})

OrderSchema.pre('save', async function (this: OrderDoc, next) {
  if (this.isNew) {
    const counter = await CounterModel.findByIdAndUpdate(
      'orders',
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    )
    this.seq = counter.seq
  }
  next()
})

OrderSchema.index({ removed: 1, seq: -1 })
OrderSchema.index({ warehouseId: 1, removed: 1 })
OrderSchema.index({ orderStatusId: 1, removed: 1 })
OrderSchema.index({ orderSourceId: 1, removed: 1 })
OrderSchema.index({ clientId: 1 })
OrderSchema.index({ orderPaymentStatus: 1, removed: 1 })
OrderSchema.index({ createdBy: 1 })
OrderSchema.index({ createdAt: -1 })
OrderSchema.index({ seq: 1 })

OrderItemSchema.index({ orderId: 1, removed: 1 })
OrderItemSchema.index({ productId: 1 })

export const OrderModel = mongoose.model<OrderDoc>('order', OrderSchema)
export const OrderItemModel = mongoose.model<OrderItemDoc>('order-item', OrderItemSchema)
