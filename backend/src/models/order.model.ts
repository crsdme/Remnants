import type { Order, OrderItem } from '../types/order.type'
import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { uuidValidator } from '../utils/uuidValidator'
import { CounterModel } from './counter.model'

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
    warehouse: {
      type: String,
      ref: 'Warehouse',
      required: true,
    },
    deliveryService: {
      type: String,
      ref: 'DeliveryService',
      required: true,
    },
    orderSource: {
      type: String,
      ref: 'OrderSource',
      required: true,
    },
    orderStatus: {
      type: String,
      ref: 'OrderStatus',
      required: true,
    },
    orderPayments: [{
      type: String,
      ref: 'OrderPayment',
      required: true,
    }],
    client: {
      type: String,
      ref: 'Client',
    },
    comment: {
      type: String,
      default: '',
    },
    createdBy: {
      type: String,
      ref: 'User',
    },
    confirmedBy: {
      type: String,
      ref: 'User',
    },
    removedBy: {
      type: String,
      ref: 'User',
    },
    removed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

const OrderItemSchema: Schema = new Schema({
  order: {
    type: String,
    required: true,
    ref: 'Order',
  },
  product: {
    type: String,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  purchasePrice: {
    type: Number,
    required: true,
  },
  purchaseCurrency: {
    type: String,
    ref: 'Currency',
    required: true,
  },
  profit: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  discountAmount: {
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

OrderSchema.pre('save', async function (next) {
  const doc = this as any

  if (doc.isNew && !doc.seq) {
    const counter = await CounterModel.findByIdAndUpdate(
      'orders',
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    )
    doc.seq = counter.seq
  }

  next()
})

export const OrderModel = mongoose.model<Order>('order', OrderSchema)
export const OrderItemModel = mongoose.model<OrderItem>('order-item', OrderItemSchema)
