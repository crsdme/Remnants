import type { Quantity } from '../types/quantity.type'
import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { uuidValidator } from '../utils/uuidValidator'

const QuantitySchema: Schema = new Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
      validate: uuidValidator,
    },
    count: {
      type: Number,
      default: 0,
    },
    product: {
      type: String,
      ref: 'Product',
      required: true,
    },
    warehouse: {
      type: String,
      ref: 'Warehouse',
      required: true,
    },
  },
  { timestamps: true },
)

QuantitySchema.virtual('autoStatus').get(function (this: any) {
  if (this.count > 0)
    return 'available'
  if (this.count === 0)
    return 'sold'
  return 'reserved'
})

QuantitySchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id
    delete ret._id
  },
})

QuantitySchema.index({ product: 1, warehouse: 1 })

export const QuantityModel = mongoose.model<Quantity>('Quantity', QuantitySchema)
