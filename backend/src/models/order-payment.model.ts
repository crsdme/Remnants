import type { HydratedDocument } from 'mongoose'
import type { OrderPaymentDB } from '@/types'
import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { uuidValidator } from '@/utils/'

type OrderPaymentDoc = HydratedDocument<OrderPaymentDB>

const OrderPaymentSchema: Schema = new Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
      validate: uuidValidator,
    },
    orderId: {
      type: String,
      ref: 'Order',
      required: true,
    },
    cashregisterId: {
      type: String,
      ref: 'Cashregister',
      required: true,
    },
    cashregisterAccountId: {
      type: String,
      ref: 'CashregisterAccount',
    },
    minorAmount: {
      type: Number,
      required: true,
    },
    currencyId: {
      type: String,
      ref: 'Currency',
      required: true,
    },
    paymentDate: {
      type: Date,
      default: new Date(),
    },
    transactionId: {
      type: String,
      ref: 'MoneyTransaction',
    },
    comment: {
      type: String,
      default: '',
    },
    createdBy: {
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

OrderPaymentSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.removed
  },
})

OrderPaymentSchema.index({ orderId: 1, removed: 1 })
OrderPaymentSchema.index({ cashregisterId: 1 })
OrderPaymentSchema.index({ cashregisterAccountId: 1 })
OrderPaymentSchema.index({ transactionId: 1 })
OrderPaymentSchema.index({ paymentDate: -1 })
OrderPaymentSchema.index({ createdAt: -1 })

export const OrderPaymentModel = mongoose.model<OrderPaymentDoc>('order-payment', OrderPaymentSchema)
