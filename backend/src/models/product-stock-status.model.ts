import type { HydratedDocument } from 'mongoose'
import type { SUPPORTED_LANGUAGES_TYPE } from '@/config/constants'
import type { ProductStockStatusDB } from '@/types'
import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { SUPPORTED_LANGUAGES } from '@/config/constants'
import { uuidValidator } from '@/utils/'

type ProductStockStatusDoc = HydratedDocument<ProductStockStatusDB>

const ProductStockStatusConditionSchema = new Schema({
  field: {
    type: String,
    enum: ['qty', 'daysSinceLastSale', 'daysSinceQtyChange'],
    required: true,
  },
  operator: {
    type: String,
    enum: ['eq', 'neq', 'lt', 'lte', 'gt', 'gte'],
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
}, { _id: false })

const ProductStockStatusSchema: Schema = new Schema(
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
    color: {
      type: String,
      default: '#000000',
    },
    priority: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    conditions: {
      type: [ProductStockStatusConditionSchema],
      default: [],
    },
    removed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

ProductStockStatusSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.removed
  },
})

ProductStockStatusSchema.index({ removed: 1 })
ProductStockStatusSchema.index({ priority: 1 })
ProductStockStatusSchema.index({ active: 1, removed: 1 })
ProductStockStatusSchema.index({ isDefault: 1, removed: 1 })

export const ProductStockStatusModel = mongoose.model<ProductStockStatusDoc>('product-stock-status', ProductStockStatusSchema)
