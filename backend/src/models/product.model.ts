import type { Product } from '../types/product.type'
import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { SUPPORTED_LANGUAGES } from '../config/constants'
import { uuidValidator } from '../utils/uuidValidator'

const ProductSchema: Schema = new Schema(
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
    price: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      ref: 'Currency',
      required: true,
    },
    purchasePrice: {
      type: Number,
      required: true,
      default: 0,
    },
    purchaseCurrency: {
      type: String,
      ref: 'Currency',
      required: true,
    },
    categories: [{
      type: String,
      ref: 'Category',
    }],
    unit: {
      type: String,
      ref: 'Unit',
      required: true,
    },
    images: [{
      path: {
        type: String,
        required: true,
      },
      filename: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        required: true,
      },
    }],
    productPropertiesGroup: {
      type: String,
      ref: 'ProductPropertiesGroup',
    },
    productProperties: [{
      _id: {
        type: String,
        ref: 'ProductProperties',
        required: true,
      },
      value: {
        type: Schema.Types.Mixed,
      },
    }],
    quantity: [{
      type: String,
      ref: 'Quantity',
    }],
    barcodes: [{
      type: String,
      ref: 'Barcode',
    }],
    removed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

ProductSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id
    ret.images = ret.images.map((image: any) => ({
      id: image._id,
      path: image.path,
      filename: image.filename,
      name: image.name,
      type: image.type,
    }))
    delete ret._id
    delete ret.removed
  },
})

ProductSchema.index({ removed: 1 })

export const ProductModel = mongoose.model<Product>('Product', ProductSchema)
