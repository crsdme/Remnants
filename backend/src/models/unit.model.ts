import type { HydratedDocument } from 'mongoose'
import type { SUPPORTED_LANGUAGES_TYPE } from '@/config/constants'
import type { UnitDB } from '@/types/'
import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { SUPPORTED_LANGUAGES } from '@/config/constants'
import { CounterModel } from '@/models/'
import { uuidValidator } from '@/utils/'

type UnitDoc = HydratedDocument<UnitDB>

const UnitSchema: Schema = new Schema(
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
    symbols: {
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

UnitSchema.index({ 'names.ru': 1 })
UnitSchema.index({ 'names.en': 1 })
UnitSchema.index({ 'symbols.ru': 1 })
UnitSchema.index({ 'symbols.en': 1 })
UnitSchema.index({ active: 1 })
UnitSchema.index({ priority: 1 })
UnitSchema.index({ removed: 1 })
UnitSchema.index({ createdAt: 1 })

UnitSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.removed
  },
})

UnitSchema.pre('save', async function (this: UnitDoc, next) {
  if (this.isNew) {
    await CounterModel.findByIdAndUpdate(
      'units',
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    )
  }
  next()
})

export const UnitModel = mongoose.model<UnitDoc>('unit', UnitSchema)
