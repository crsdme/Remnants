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

export const OrderPaymentModel = mongoose.model<OrderPaymentDoc>('order-payment', OrderPaymentSchema)
