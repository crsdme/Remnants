import type { CashregisterAccount } from '../types/cashregister-account.type'
import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

import { SUPPORTED_LANGUAGES } from '../config/constants'
import { uuidValidator } from '../utils/uuidValidator'
import { CounterModel } from './counter.model'

const CashregisterAccountSchema: Schema = new Schema(
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
            SUPPORTED_LANGUAGES.includes(key as any),
          )
        },
        message: 'Supported languages only',
      },
    },
    currencies: [{
      type: String,
      required: true,
      ref: 'Currency',
    }],
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

CashregisterAccountSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id
    ret.seq = ret.seq || 0
    delete ret._id
    delete ret.removed
  },
})

CashregisterAccountSchema.pre('save', async function (next) {
  const doc = this as any

  if (doc.isNew && !doc.seq) {
    const counter = await CounterModel.findByIdAndUpdate(
      'cashregister-accounts',
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    )
    doc.seq = counter.seq
  }

  next()
})

export const CashregisterAccountModel = mongoose.model<CashregisterAccount>('cashregister-account', CashregisterAccountSchema)
