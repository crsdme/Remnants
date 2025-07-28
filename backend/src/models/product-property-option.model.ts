import type { ProductPropertyOption } from '../types/product-property-option.type'
import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { SUPPORTED_LANGUAGES } from '../config/constants'
import { uuidValidator } from '../utils/uuidValidator'

const ProductPropertyOptionSchema: Schema = new Schema(
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
    priority: {
      type: Number,
      default: 0,
    },
    productProperty: {
      type: String,
      ref: 'product-property',
    },
    active: {
      type: Boolean,
      default: true,
    },
    color: {
      type: String,
    },
    removed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

ProductPropertyOptionSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.removed
  },
})

ProductPropertyOptionSchema.index({ removed: 1 })

export const ProductPropertyOptionModel = mongoose.model<ProductPropertyOption>('product-property-option', ProductPropertyOptionSchema)
