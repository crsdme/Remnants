import type { MoneyTransaction } from '../types/money-transaction.type'
import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { CounterModel } from './counter.model'

const MoneyTransactionSchema: Schema = new Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    seq: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
      enum: [
        'income', // поступление (оплата, инвестиция)
        'expense', // расход (выплата, закупка)
        'transfer', // перемещение между счетами
        'refund', // возврат
        'investment', // инвестиции
        'purchase', // закупка
      ],
      required: true,
    },
    direction: {
      type: String,
      enum: ['in', 'out'],
      required: true,
    },
    account: {
      type: String,
      required: true,
      ref: 'CashregisterAccount',
    },
    cashregister: {
      type: String,
      required: true,
      ref: 'Cashregister',
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
    },
    sourceModel: {
      type: String,
      enum: ['investor', 'order', 'purchase', 'expense', 'manual', null],
      default: null,
    },
    sourceId: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ['from', 'to', null],
      default: null,
    },
    transferId: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: '',
    },
    confirmed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

MoneyTransactionSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id
    delete ret._id
  },
})

MoneyTransactionSchema.pre('save', async function (next) {
  const doc = this as any

  if (doc.isNew && !doc.seq) {
    const counter = await CounterModel.findByIdAndUpdate(
      'money-transactions',
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    )
    doc.seq = counter.seq
  }

  next()
})

export const MoneyTransactionModel = mongoose.model<MoneyTransaction>('money-transaction', MoneyTransactionSchema)
