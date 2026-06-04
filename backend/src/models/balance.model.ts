import type { Balance } from '@remnant/shared'
import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { CounterModel } from '@/models/'

const WarehouseBalanceSchema = new Schema(
  {
    warehouseId: { type: String, required: true },
    totals: [{
      currencyId: { type: String, required: true },
      amount: { type: Number, required: true },
    }],
  },
  { _id: false },
)

const CashregisterBalanceSchema = new Schema(
  {
    cashregisterId: { type: String, required: true },
    totals: [{
      currencyId: { type: String, required: true },
      amount: { type: Number, required: true },
    }],
  },
  { _id: false },
)

const TotalBalanceSchema = new Schema(
  {
    currencyId: { type: String, required: true },
    amount: { type: Number, required: true },
  },
  { _id: false },
)

const BalanceSchema: Schema = new Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    seq: {
      type: Number,
      default: 0,
    },
    warehouseBalances: [
      WarehouseBalanceSchema,
    ],
    cashregisterBalances: [
      CashregisterBalanceSchema,
    ],
    totalBalances: [
      TotalBalanceSchema,
    ],
    comment: {
      type: String,
      default: '',
    },
    createdBy: {
      type: String,
      ref: 'User',
      required: true,
    },
    removedBy: {
      type: String,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true },
)

BalanceSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id
    delete ret._id
  },
})

BalanceSchema.pre('save', async function (next) {
  const doc = this as any

  if (doc.isNew && !doc.seq) {
    const counter = await CounterModel.findByIdAndUpdate(
      'balances',
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    )
    doc.seq = counter.seq
  }

  next()
})

export const BalanceModel = mongoose.model<Balance>('balance', BalanceSchema)
