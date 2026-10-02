import type { HydratedDocument } from 'mongoose'
import type { PaymentApplicationDB } from '@/types'
import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { CounterModel } from '@/models/'
import { uuidValidator } from '@/utils/'

type PaymentApplicationDoc = HydratedDocument<PaymentApplicationDB>

const PaymentApplicationSchema: Schema = new Schema(
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
    partyType: {
      type: String,
      enum: ['client', 'supplier'],
      required: true,
    },
    partyId: {
      type: String,
      required: true,
    },
    documentType: {
      type: String,
      enum: ['order', 'procurement'],
      required: true,
    },
    documentId: {
      type: String,
      required: true,
    },
    moneyTransactionId: {
      type: String,
      ref: 'money-transaction',
      required: true,
    },
    currencyId: {
      type: String,
      ref: 'Currency',
      required: true,
    },
    minorAmount: {
      type: Number,
      required: true,
    },
    comment: {
      type: String,
      default: '',
    },
    cancelled: {
      type: Boolean,
      default: false,
    },
    cancelledBy: {
      type: String,
      default: null,
      ref: 'User',
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: String,
      default: null,
      ref: 'User',
    },
  },
  { timestamps: true },
)

PaymentApplicationSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id
    delete ret._id
  },
})

PaymentApplicationSchema.pre('save', async function (this: PaymentApplicationDoc, next) {
  if (this.isNew && !this.seq) {
    const counter = await CounterModel.findByIdAndUpdate(
      'payment-applications',
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    )
    this.seq = counter.seq
  }

  next()
})

PaymentApplicationSchema.index({ documentType: 1, documentId: 1, cancelled: 1 })
PaymentApplicationSchema.index({ partyType: 1, partyId: 1, cancelled: 1 })
PaymentApplicationSchema.index({ moneyTransactionId: 1, cancelled: 1 })
PaymentApplicationSchema.index({ seq: 1 })

export const PaymentApplicationModel = mongoose.model<PaymentApplicationDoc>(
  'payment-application',
  PaymentApplicationSchema,
  'payment-applications',
)
