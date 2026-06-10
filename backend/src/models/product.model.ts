import type { HydratedDocument } from 'mongoose'
import type { SUPPORTED_LANGUAGES_TYPE } from '@/config/constants'
import type { ProductDB } from '@/types'
import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { SUPPORTED_LANGUAGES } from '@/config/constants'
import { CounterModel } from '@/models/'
import { uuidValidator } from '@/utils/'

type ProductDoc = HydratedDocument<ProductDB>

const ProductSchema: Schema = new Schema(
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
      _id: false,
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
    quantityIds: [{
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

interface ProductImage {
  _id: string
  path: string
  filename: string
  name: string
  type: string
}

ProductSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id
    ret.images = (ret.images as ProductImage[]).map((image: ProductImage) => ({
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

ProductSchema.pre('save', async function (this: ProductDoc, next) {
  if (this.isNew && !this.seq) {
    const counter = await CounterModel.findByIdAndUpdate(
      'products',
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    )
    this.seq = counter.seq
  }

  next()
})

ProductSchema.index({ names: 1 })
ProductSchema.index({ price: 1 })
ProductSchema.index({ removed: 1 })

export const ProductModel = mongoose.model<ProductDoc>('Product', ProductSchema)
