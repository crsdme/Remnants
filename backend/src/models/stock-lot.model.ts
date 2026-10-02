import type { HydratedDocument } from 'mongoose'
import type { StockLotDB } from '@/types'
import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { uuidValidator } from '@/utils/'

type StockLotDoc = HydratedDocument<StockLotDB>

const StockLotSchema: Schema = new Schema(
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
    warehouseId: {
      type: String,
      ref: 'Warehouse',
      required: true,
    },
    originalCount: {
      type: Number,
      required: true,
    },
    remainingCount: {
      type: Number,
      required: true,
    },
    minorUnitCost: {
      type: Number,
      required: true,
    },
    currencyId: {
      type: String,
      ref: 'Currency',
      required: true,
    },
    receivedAt: {
      type: Date,
      required: true,
    },
    sourceMoveId: {
      type: String,
      ref: 'stock-move',
      required: true,
    },
  },
  { timestamps: true },
)

StockLotSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id
    delete ret._id
  },
})

StockLotSchema.index({ productId: 1, warehouseId: 1, remainingCount: 1, receivedAt: 1 })
StockLotSchema.index({ sourceMoveId: 1 })
StockLotSchema.index({ warehouseId: 1, productId: 1 })

export const StockLotModel = mongoose.model<StockLotDoc>('stock-lot', StockLotSchema, 'stock-lots')
