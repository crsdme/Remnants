import type { OrderPayment } from '../types/order-payment.type'
import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { uuidValidator } from '../utils/uuidValidator'

const OrderPaymentSchema: Schema = new Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
      validate: uuidValidator,
    },
    order: {
      type: String,
      ref: 'Order',
      required: true,
    },
    cashregister: {
      type: String,
      ref: 'Cashregister',
      required: true,
    },
    cashregisterAccount: {
      type: String,
      ref: 'CashregisterAccount',
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: [
        'pending',
        'processing',
        'paid',
        'partially_paid',
        'failed',
        'cancelled',
        'refunded',
      ],
    },
    paymentDate: {
      type: Date,
      default: new Date(),
    },
    transaction: {
      type: String,
      ref: 'MoneyTransaction',
    },
    comment: {
      type: String,
      default: '',
    },
    createdBy: {
      type: String,
    },
    removedBy: {
      type: String,
    },
    removed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

OrderPaymentSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.removed
  },
})

export const OrderPaymentModel = mongoose.model<OrderPayment>('order-payment', OrderPaymentSchema)
