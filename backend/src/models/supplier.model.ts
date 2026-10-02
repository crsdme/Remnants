import type { HydratedDocument } from 'mongoose'
import type { SupplierDB } from '@/types'
import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { CounterModel } from '@/models/'
import { uuidValidator } from '@/utils/'

type SupplierDoc = HydratedDocument<SupplierDB>

const SupplierSchema: Schema = new Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
      validate: uuidValidator,
    },
    seq: {
      type: Number,
      default: 0,
    },
    name: {
      type: String,
      required: true,
    },
    emails: [{
      type: String,
    }],
    phones: [{
      type: String,
    }],
    socials: [{
      type: {
        type: String,
        required: true,
      },
      value: {
        type: String,
        required: true,
      },
    }],
    comment: {
      type: String,
      default: '',
    },
    removed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

SupplierSchema.pre('save', async function (this: SupplierDoc, next) {
  if (this.isNew && !this.seq) {
    const counter = await CounterModel.findByIdAndUpdate(
      'suppliers',
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    )
    this.seq = counter.seq
  }

  next()
})

SupplierSchema.index({ removed: 1, name: 1 })
SupplierSchema.index({ seq: 1 })
SupplierSchema.index({ createdAt: -1 })

export const SupplierModel = mongoose.model<SupplierDoc>('supplier', SupplierSchema)
