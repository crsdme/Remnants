import type { ExpenseCategory } from '../types/expense-category.type'
import type { Expense } from '../types/expense.type'
import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { SUPPORTED_LANGUAGES } from '../config/constants'
import { uuidValidator } from '../utils/uuidValidator'
import { CounterModel } from './counter.model'

const ExpenseSchema: Schema = new Schema(
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
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      ref: 'Currency',
      required: true,
    },
    cashregister: {
      type: String,
      ref: 'cashregister',
      required: true,
    },
    cashregisterAccount: {
      type: String,
      ref: 'cashregister-account',
      required: true,
    },
    categories: [{
      type: String,
      ref: 'expense-category',
      required: true,
    }],
    sourceModel: {
      type: String,
      enum: ['order', 'cashregister', 'cashregister-account', 'expense-category'],
    },
    sourceId: {
      type: String,
    },
    type: {
      type: String,
      required: true,
      enum: ['manual', 'system'],
    },
    comment: {
      type: String,
      default: '',
    },
    createdBy: {
      type: String,
      ref: 'User',
    },
    removedBy: {
      type: String,
      ref: 'User',
    },
    removed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

const ExpenseCategorySchema: Schema = new Schema(
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
            SUPPORTED_LANGUAGES.includes(key as any),
          )
        },
      },
    },
    priority: {
      type: Number,
      default: 0,
    },
    color: {
      type: String,
      default: '#000000',
    },
    comment: {
      type: String,
      default: '',
    },
    removed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

ExpenseSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.removed
  },
})

ExpenseSchema.pre('save', async function (next) {
  const doc = this as any

  if (doc.isNew && !doc.seq) {
    const counter = await CounterModel.findByIdAndUpdate(
      'expenses',
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    )
    doc.seq = counter.seq
  }

  next()
})

export const ExpenseModel = mongoose.model<Expense>('expense', ExpenseSchema)
export const ExpenseCategoryModel = mongoose.model<ExpenseCategory>('expense-category', ExpenseCategorySchema)
