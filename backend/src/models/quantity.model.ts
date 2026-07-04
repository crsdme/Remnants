import type { HydratedDocument } from 'mongoose'
import type { QuantityDB } from '@/types/'
import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { uuidValidator } from '@/utils/'

type QuantityDoc = HydratedDocument<QuantityDB>

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
    productId: {
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

// eslint-disable-next-line no-unused-vars
QuantitySchema.virtual('status').get(function (this: QuantityDoc) {
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

QuantitySchema.index({ productId: 1, warehouse: 1 })

export const QuantityModel = mongoose.model<QuantityDoc>('quantity', QuantitySchema)
