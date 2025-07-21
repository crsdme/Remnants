import type { WarehouseTransaction, WarehouseTransactionItem } from '../types/warehouse-transaction.type'
import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { CounterModel } from './counter.model'

const WarehouseTransactionSchema: Schema = new Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    seq: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
      enum: ['in', 'out', 'transfer'],
      required: true,
    },
    fromWarehouse: {
      type: String,
      default: null,
      ref: 'Warehouse',
    },
    toWarehouse: {
      type: String,
      default: null,
      ref: 'Warehouse',
    },
    requiresReceiving: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['draft', 'confirmed', 'awaiting', 'received', 'cancelled'],
      default: 'draft',
    },
    accepted: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: String,
      ref: 'User',
      required: true,
    },
    acceptedBy: {
      type: String,
      ref: 'User',
      default: null,
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
    acceptedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
)

const WarehouseTransactionItemSchema: Schema = new Schema({
  transactionId: {
    type: String,
    required: true,
    ref: 'WarehouseTransaction',
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
})

WarehouseTransactionSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id
    delete ret._id
  },
})

WarehouseTransactionSchema.pre('save', async function (next) {
  const doc = this as any

  if (doc.isNew && !doc.seq) {
    const counter = await CounterModel.findByIdAndUpdate(
      'warehouse-transactions',
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    )
    doc.seq = counter.seq
  }

  next()
})

export const WarehouseTransactionModel = mongoose.model<WarehouseTransaction>('warehouse-transaction', WarehouseTransactionSchema)
export const WarehouseTransactionItemModel = mongoose.model<WarehouseTransactionItem>('warehouse-transaction-item', WarehouseTransactionItemSchema)
