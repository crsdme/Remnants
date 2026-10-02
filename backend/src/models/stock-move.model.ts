import type { HydratedDocument } from 'mongoose'
import type { StockMoveDB } from '@/types'
import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { uuidValidator } from '@/utils/'

type StockMoveDoc = HydratedDocument<StockMoveDB>

const StockMoveLayerSchema = new Schema(
  {
    lotId: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    minorUnitCost: {
      type: Number,
      required: true,
    },
    currencyId: {
      type: String,
      required: true,
    },
    receivedAt: {
      type: Date,
      required: true,
    },
  },
  { _id: false },
)

const StockMoveSchema: Schema = new Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
      validate: uuidValidator,
    },
    productId: {
      type: String,
      ref: 'Product',
      required: true,
    },
    fromKind: {
      type: String,
      enum: ['warehouse', 'supplier', 'customer', 'transit', 'adjustment'],
      required: true,
    },
    toKind: {
      type: String,
      enum: ['warehouse', 'supplier', 'customer', 'transit', 'adjustment'],
      required: true,
    },
    fromWarehouseId: {
      type: String,
      ref: 'Warehouse',
      default: null,
    },
    toWarehouseId: {
      type: String,
      ref: 'Warehouse',
      default: null,
    },
    quantity: {
      type: Number,
      required: true,
    },
    openQuantity: {
      type: Number,
      default: 0,
    },
    layers: {
      type: [StockMoveLayerSchema],
      default: [],
    },
    documentType: {
      type: String,
      enum: ['order', 'warehouse-transaction', 'inventory', 'procurement', 'migration'],
      required: true,
    },
    documentId: {
      type: String,
      required: true,
    },
    documentItemId: {
      type: String,
      default: null,
    },
    userId: {
      type: String,
      ref: 'User',
      default: null,
    },
    cancelled: {
      type: Boolean,
      default: false,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancelledBy: {
      type: String,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true },
)

StockMoveSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id
    delete ret._id
  },
})

StockMoveSchema.index({ productId: 1, createdAt: -1 })
StockMoveSchema.index({ documentType: 1, documentId: 1, cancelled: 1 })
StockMoveSchema.index({ documentType: 1, documentId: 1, documentItemId: 1 })
StockMoveSchema.index({ fromWarehouseId: 1, createdAt: -1 })
StockMoveSchema.index({ toWarehouseId: 1, createdAt: -1 })
StockMoveSchema.index({ cancelled: 1, toKind: 1, productId: 1 })

export const StockMoveModel = mongoose.model<StockMoveDoc>('stock-move', StockMoveSchema, 'stock-moves')
