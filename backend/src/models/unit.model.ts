import mongoose, { Schema } from 'mongoose'
import { SUPPORTED_LANGUAGES } from '../config/constants'

export interface Unit {
  names: string
  symbols: string
  priority: number
  active: boolean
  removed: boolean
}

const UnitSchema: Schema = new Schema(
  {
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
    symbols: {
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
    priority: {
      type: Schema.Types.Number,
      default: 0,
    },
    active: {
      type: Schema.Types.Boolean,
      default: true,
    },
    removed: {
      type: Schema.Types.Boolean,
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

const UnitModel = mongoose.model<Unit>('Unit', UnitSchema)

export { UnitModel }
