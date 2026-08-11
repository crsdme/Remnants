import type { HydratedDocument } from 'mongoose'
import type { MoneyTransactionDB } from '@/types'
import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { CounterModel } from '@/models/'

type MoneyTransactionDoc = HydratedDocument<MoneyTransactionDB>

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
        'cancelled', // отмена поступления
        'expense', // расход (выплата, закупка)
        'transfer', // перемещение между счетами
        'refund', // возврат
        'investment', // инвестиции
        'purchase', // закупка
        'procurement', // закупка
      ],
      required: true,
    },
    direction: {
      type: String,
      enum: ['in', 'out'],
      required: true,
    },
    accountId: {
      type: String,
      required: true,
      ref: 'CashregisterAccount',
    },
    cashregisterId: {
      type: String,
      required: true,
      ref: 'Cashregister',
    },
    minorAmount: {
      type: Number,
      required: true,
    },
    currencyId: {
      type: String,
      ref: 'Currency',
      required: true,
    },
    sourceModel: {
      type: String,
      enum: ['investor', 'order', 'purchase', 'expense', 'manual', 'procurement', null],
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

MoneyTransactionSchema.pre('save', async function (this: MoneyTransactionDoc, next) {
  if (this.isNew && !this.seq) {
    const counter = await CounterModel.findByIdAndUpdate(
      'money-transactions',
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    )
    this.seq = counter.seq
  }

  next()
})

MoneyTransactionSchema.index({ cashregisterId: 1, createdAt: -1 })
MoneyTransactionSchema.index({ accountId: 1, createdAt: -1 })
MoneyTransactionSchema.index({ sourceModel: 1, sourceId: 1 })
MoneyTransactionSchema.index({ type: 1, createdAt: -1 })
MoneyTransactionSchema.index({ transferId: 1 })
MoneyTransactionSchema.index({ seq: 1 })
MoneyTransactionSchema.index({ createdAt: -1 })

export const MoneyTransactionModel = mongoose.model<MoneyTransactionDoc>('money-transaction', MoneyTransactionSchema)
