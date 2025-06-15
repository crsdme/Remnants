import type { ProductProperty } from '../types/product-property.type'
import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { SUPPORTED_LANGUAGES } from '../config/constants'
import { uuidValidator } from '../utils/uuidValidator'

const ProductPropertySchema: Schema = new Schema(
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
        message: 'ru en keys only',
      },
    },
    options: {
      type: Array,
      ref: 'ProductPropertyOption',
    },
    priority: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
      enum: ['text', 'select', 'color', 'number', 'boolean', 'multiSelect'],
    },
    isRequired: {
      type: Boolean,
      default: false,
    },
    showInTable: {
      type: Boolean,
      default: false,
    },
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

ProductPropertySchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.removed
  },
})

ProductPropertySchema.index({ removed: 1 })

export const ProductPropertyModel = mongoose.model<ProductProperty>('product-property', ProductPropertySchema)
