import type { OrderStatus } from '../types/order-status.type'
import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { SUPPORTED_LANGUAGES } from '../config/constants'
import { uuidValidator } from '../utils/uuidValidator'

const OrderStatusSchema: Schema = new Schema(
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
    isLocked: {
      type: Boolean,
      default: false,
    },
    removed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

OrderStatusSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.removed
  },
})

export const OrderStatusModel = mongoose.model<OrderStatus>('order-status', OrderStatusSchema)
