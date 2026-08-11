import type { HydratedDocument } from 'mongoose'
import type { BarcodeDB } from '@/types'
import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { CounterModel } from '@/models/'
import { uuidValidator } from '@/utils/'

type BarcodeDoc = HydratedDocument<BarcodeDB>

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
      unitsPerScan: {
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

BarcodeSchema.pre('save', async function (this: BarcodeDoc, next) {
  if (this.isNew) {
    await CounterModel.findByIdAndUpdate(
      'barcodes',
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    )
  }
  next()
})

BarcodeSchema.index({ code: 1 })
BarcodeSchema.index({ 'products._id': 1 })
BarcodeSchema.index({ removed: 1, active: 1 })

export const BarcodeModel = mongoose.model<BarcodeDB>('Barcode', BarcodeSchema)
