import type { Types } from 'mongoose'
import mongoose, { Schema } from 'mongoose'

const { ObjectId, Mixed } = Schema.Types

export interface ProductInterface {
  names: {
    ua: string
    ru: string
    en: string
    tr: string
  }
  customFieldsGroup: Types.ObjectId
  customFields: Array<{
    _id: Types.ObjectId
    data: any
  }>
  images: Array<{
    main: {
      name: string
      path: string
    }
    preview: {
      name: string
      path: string
    }
  }>
  price: number
  unit: Types.ObjectId
  currency: Types.ObjectId
  discount: number
  wholesalePrice: number
  wholesaleCurrency: Types.ObjectId
  quantity: Types.ObjectId[]
  barcode: Array<{
    number: Types.ObjectId
  }>
  categories: Array<{
    _id: Types.ObjectId
  }>
  removed: boolean
  createdAt?: Date
  updatedAt?: Date
}

const ProductSchema: Schema = new Schema(
  {
    names: {
      ua: {
        type: String,
      },
      ru: {
        type: String,
      },
      en: {
        type: String,
      },
      tr: {
        type: String,
      },
    },
    customFieldsGroup: {
      type: ObjectId,
      ref: 'custom-field-group',
    },
    customFields: [
      {
        _id: {
          type: ObjectId,
          ref: 'custom-field',
        },
        data: {
          type: Mixed,
          ref: 'custom-field-options',
        },
      },
    ],
    images: [
      {
        main: {
          name: {
            type: String,
          },
          path: {
            type: String,
          },
        },
        preview: {
          name: {
            type: String,
          },
          path: {
            type: String,
          },
        },
      },
    ],
    price: {
      type: Number,
      required: true,
    },
    unit: {
      type: ObjectId,
      ref: 'units',
    },
    currency: {
      type: ObjectId,
      ref: 'currency',
    },
    discount: {
      type: Number,
      default: 0,
    },
    wholesalePrice: {
      type: Number,
      default: 0,
    },
    wholesaleCurrency: {
      type: ObjectId,
      ref: 'currency',
    },
    quantity: [
      {
        type: ObjectId,
        ref: 'quantity',
      },
    ],
    barcode: [
      {
        number: {
          type: ObjectId,
          ref: 'barcode',
        },
      },
    ],
    categories: [
      {
        _id: {
          type: ObjectId,
          ref: 'category',
        },
      },
    ],
    removed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

export default mongoose.model<ProductInterface>('Product', ProductSchema)
