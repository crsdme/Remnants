import type { HydratedDocument } from 'mongoose'
import type { WarehouseTransactionLogDB } from '@/types/'
import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { uuidValidator } from '@/utils/'

type WarehouseTransactionLogDoc = HydratedDocument<WarehouseTransactionLogDB>

const WarehouseTransactionLogSchema: Schema = new Schema(
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
    deltaCount: {
      type: Number,
      required: true,
    },
    previousCount: {
      type: Number,
      required: false,
    },
    afterCount: {
      type: Number,
      required: false,
    },
    refType: {
      type: String,
      required: true,
      enum: ['product', 'warehouse', 'order', 'warehouse-transaction', 'inventory'],
    },
    refId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
)

WarehouseTransactionLogSchema.index({ productId: 1, warehouseId: 1, createdAt: 1 })
WarehouseTransactionLogSchema.index({ refType: 1, refId: 1 })
WarehouseTransactionLogSchema.index({ userId: 1 })
WarehouseTransactionLogSchema.index({ createdAt: -1 })

WarehouseTransactionLogSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id
    delete ret._id
  },
})

export const WarehouseTransactionLogModel = mongoose.model<WarehouseTransactionLogDoc>('warehouse-transaction-log', WarehouseTransactionLogSchema)
