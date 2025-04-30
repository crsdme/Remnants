import mongoose, { Schema } from 'mongoose'
import { SUPPORTED_LANGUAGES } from '../config/constants'

export interface CurrencyInterface {
  names: string
  symbols: string
  priority: number
  active: boolean
  removed: boolean
}

const CurrencySchema: Schema = new Schema(
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

CurrencySchema.index({ 'names.ru': 1 })
CurrencySchema.index({ 'names.en': 1 })
CurrencySchema.index({ 'symbols.ru': 1 })
CurrencySchema.index({ 'symbols.en': 1 })
CurrencySchema.index({ active: 1 })
CurrencySchema.index({ priority: 1 })
CurrencySchema.index({ removed: 1 })
CurrencySchema.index({ createdAt: 1 })

const CurrencyModel = mongoose.model<CurrencyInterface>('Currency', CurrencySchema)

export { CurrencyModel }
