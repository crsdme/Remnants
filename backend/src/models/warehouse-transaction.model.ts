import type { HydratedDocument } from 'mongoose'
import type { WarehouseTransactionDB, WarehouseTransactionItemDB } from '@/types/'
import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { CounterModel } from '@/models/'

type WarehouseTransactionDoc = HydratedDocument<WarehouseTransactionDB>

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
    fromWarehouseId: {
      type: String,
      default: null,
      ref: 'Warehouse',
    },
    toWarehouseId: {
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
    removed: {
      type: Boolean,
      default: false,
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

type WarehouseTransactionItemDoc = HydratedDocument<WarehouseTransactionItemDB>

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

WarehouseTransactionSchema.pre('save', async function (this: WarehouseTransactionDoc, next) {
  if (this.isNew && !this.seq) {
    const counter = await CounterModel.findByIdAndUpdate(
      'warehouse-transactions',
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    )
    this.seq = counter.seq
  }

  next()
})

WarehouseTransactionSchema.index({ removed: 1, seq: -1 })
WarehouseTransactionSchema.index({ status: 1, removed: 1 })
WarehouseTransactionSchema.index({ fromWarehouseId: 1 })
WarehouseTransactionSchema.index({ toWarehouseId: 1 })
WarehouseTransactionSchema.index({ createdAt: -1 })
WarehouseTransactionSchema.index({ seq: 1 })

WarehouseTransactionItemSchema.index({ transactionId: 1 })
WarehouseTransactionItemSchema.index({ productId: 1 })

export const WarehouseTransactionModel = mongoose.model<WarehouseTransactionDoc>('warehouse-transaction', WarehouseTransactionSchema)
export const WarehouseTransactionItemModel = mongoose.model<WarehouseTransactionItemDoc>('warehouse-transaction-item', WarehouseTransactionItemSchema)
