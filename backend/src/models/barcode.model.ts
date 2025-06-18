import type { Barcode } from '../types/barcode.type'
import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { uuidValidator } from '../utils/uuidValidator'
import { CounterModel } from './counter.model'

const BarcodeSchema: Schema = new Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
      validate: uuidValidator,
    },
    code: {
      type: String,
      required: true,
    },
    products: [{
      _id: {
        type: String,
        ref: 'products',
      },
      quantity: {
        type: Number,
        default: 1,
      },
    }],
    active: {
      type: Boolean,
      default: true,
    },
    removed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

BarcodeSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id
    ret.products = ret.products.map((product: any) => ({
      ...product,
      _id: undefined,
      id: product._id,
      quantity: product.quantity,
    }))
    delete ret._id
    delete ret.removed
  },
})

BarcodeSchema.pre('save', async function (next) {
  const doc = this as any

  if (doc.isNew) {
    await CounterModel.findByIdAndUpdate(
      'barcodes',
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    )
  }

  next()
})

BarcodeSchema.index({ removed: 1 })

export const BarcodeModel = mongoose.model<Barcode>('Barcode', BarcodeSchema)
