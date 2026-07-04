import type { HydratedDocument } from 'mongoose'
import type { SUPPORTED_LANGUAGES_TYPE } from '@/config/constants'
import type { CurrencyDB, ExchangeRateDB } from '@/types'
import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { SUPPORTED_LANGUAGES } from '@/config/constants'
import { CounterModel } from '@/models/'
import { uuidValidator } from '@/utils/'

type CurrencyDoc = HydratedDocument<CurrencyDB>

const CurrencySchema: Schema = new Schema(
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
    scale: {
      type: Number,
      default: 2,
    },
    paymentEpsilon: {
      type: Number,
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

type ExchangeRateDoc = HydratedDocument<ExchangeRateDB>

const ExchangeRateSchema: Schema = new Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
      validate: uuidValidator,
    },
    fromCurrency: {
      type: String,
      required: true,
      ref: 'Currency',
      validate: uuidValidator,
    },
    toCurrency: {
      type: String,
      required: true,
      ref: 'Currency',
      validate: uuidValidator,
    },
    rate: {
      type: Number,
      required: true,
      min: 0,
    },
    comment: {
      type: String,
    },
    removed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

CurrencySchema.index({ active: 1 })
CurrencySchema.index({ priority: 1 })
CurrencySchema.index({ removed: 1 })
CurrencySchema.index({ createdAt: 1 })

CurrencySchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.removed
  },
})

CurrencySchema.pre('save', async function (this: CurrencyDoc, next) {
  if (this.paymentEpsilon == null)
    this.paymentEpsilon = 10 ** (1 - (this.scale ?? 2))

  if (this.isNew && !this.seq) {
    const counter = await CounterModel.findByIdAndUpdate(
      'currencies',
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    )
    this.seq = counter.seq
  }

  next()
})

export const CurrencyModel = mongoose.model<CurrencyDoc>('Currency', CurrencySchema)
export const ExchangeRateModel = mongoose.model<ExchangeRateDoc>('Exchange-Rate', ExchangeRateSchema)
