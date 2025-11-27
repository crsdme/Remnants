import type { Procurement, ProcurementItem } from '../types/procurement.type'
import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { CounterModel } from './counter.model'

const ProcurementSchema: Schema = new Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    seq: {
      type: Number,
      default: 0,
    },
    supplier: {
      type: String,
      ref: 'Supplier',
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'ordered', 'partially-received', 'received', 'closed', 'cancelled'],
      default: 'draft',
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'partially-paid', 'paid', 'overpaid'],
      default: 'unpaid',
      required: true,
    },
    expenses: [{
      type: String,
      ref: 'Expense',
    }],
    payments: [{
      type: String,
      ref: 'money-transaction',
    }],
    createdBy: {
      type: String,
      ref: 'User',
      required: true,
    },
    removedBy: {
      type: String,
      ref: 'User',
      default: null,
    },
    comment: {
      type: String,
      default: '',
    },
  },
  { timestamps: true },
)

const ProcurementItemSchema: Schema = new Schema({
  procurementId: {
    type: String,
    required: true,
    ref: 'Procurement',
  },
  productId: {
    type: String,
    required: true,
    ref: 'Product',
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  receivedQuantity: {
    type: Number,
    default: 0,
  },
  purchasePrice: {
    type: Number,
    required: true,
  },
  purchaseCurrency: {
    type: String,
    required: true,
    ref: 'Currency',
  },
})

ProcurementSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id
    delete ret._id
  },
})

ProcurementSchema.pre('save', async function (next) {
  const doc = this as any

  if (doc.isNew && !doc.seq) {
    const counter = await CounterModel.findByIdAndUpdate(
      'procurements',
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    )
    doc.seq = counter.seq
  }

  next()
})

export const ProcurementModel = mongoose.model<Procurement>('procurement', ProcurementSchema)
export const ProcurementItemModel = mongoose.model<ProcurementItem>('procurement-item', ProcurementItemSchema)
