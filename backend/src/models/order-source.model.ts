import type { OrderSource } from '../types/order-source.type'
import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { SUPPORTED_LANGUAGES } from '../config/constants'
import { uuidValidator } from '../utils/uuidValidator'

const OrderSourceSchema: Schema = new Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
      validate: uuidValidator,
    },
    names: {
      type: Map,
      of: String,
      required: true,
      validate: {
        validator(value: Map<string, string>) {
          return Array.from(value.keys()).every(key =>
            SUPPORTED_LANGUAGES.includes(key as any),
          )
        },
        message: 'Supported languages only',
      },
    },
    color: {
      type: String,
      default: '#000000',
    },
    priority: {
      type: Number,
      default: 0,
    },
    removed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

OrderSourceSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.removed
  },
})

export const OrderSourceModel = mongoose.model<OrderSource>('OrderSource', OrderSourceSchema)
