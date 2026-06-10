import type { HydratedDocument } from 'mongoose'
import type { SUPPORTED_LANGUAGES_TYPE } from '@/config/constants'
import type { ProductPropertyOptionDB } from '@/types/'
import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { SUPPORTED_LANGUAGES } from '@/config/constants'
import { uuidValidator } from '@/utils/'

type ProductPropertyOptionDoc = HydratedDocument<ProductPropertyOptionDB>

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
            SUPPORTED_LANGUAGES.includes(key as SUPPORTED_LANGUAGES_TYPE),
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

export const ProductPropertyOptionModel = mongoose.model<ProductPropertyOptionDoc>('product-property-option', ProductPropertyOptionSchema)
