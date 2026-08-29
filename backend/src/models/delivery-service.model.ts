import type { HydratedDocument } from 'mongoose'
import type { SUPPORTED_LANGUAGES_TYPE } from '@/config/constants'
import type { DeliveryServiceDB } from '@/types'
import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { SUPPORTED_LANGUAGES } from '@/config/constants'
import { uuidValidator } from '@/utils/'

type DeliveryServiceDoc = HydratedDocument<DeliveryServiceDB>

const DeliveryServiceSchema: Schema = new Schema(
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
    type: {
      type: String,
      enum: ['novaposhta', 'selfpickup'],
      required: true,
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
    credentials: {
      type: Schema.Types.Mixed,
      default: undefined,
    },
    removed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

DeliveryServiceSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.removed
  },
})

DeliveryServiceSchema.index({ removed: 1, active: 1 })
DeliveryServiceSchema.index({ priority: 1 })
DeliveryServiceSchema.index({ type: 1, removed: 1 })

export const DeliveryServiceModel = mongoose.model<DeliveryServiceDoc>('delivery-service', DeliveryServiceSchema)
