import type { HydratedDocument } from 'mongoose'
import type { SUPPORTED_LANGUAGES_TYPE } from '@/config/constants'
import type { ExpenseCategoryDB, ExpenseDB } from '@/types'
import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { SUPPORTED_LANGUAGES } from '@/config/constants'
import { CounterModel } from '@/models/'
import { uuidValidator } from '@/utils/'

type ExpenseDoc = HydratedDocument<ExpenseDB>

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
    minorAmount: {
      type: Number,
      required: true,
    },
    currencyId: {
      type: String,
      ref: 'Currency',
      required: true,
    },
    cashregisterId: {
      type: String,
      ref: 'cashregister',
      required: true,
    },
    cashregisterAccountId: {
      type: String,
      ref: 'cashregister-account',
      required: true,
    },
    categoryIds: [{
      type: String,
      ref: 'expense-category',
      required: true,
    }],
    sourceModel: {
      type: String,
      enum: ['manual', 'cashregister', 'cashregister-account', 'order', 'expense', 'procurement'],
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
    files: [{
      _id: false,
      path: {
        type: String,
        required: true,
      },
      filename: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        required: true,
      },
    }],
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

type ExpenseCategoryDoc = HydratedDocument<ExpenseCategoryDB>

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

ExpenseSchema.pre('save', async function (this: ExpenseDoc, next) {
  if (this.isNew && !this.seq) {
    const counter = await CounterModel.findByIdAndUpdate(
      'expenses',
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    )
    this.seq = counter.seq
  }

  next()
})

ExpenseSchema.index({ removed: 1, seq: -1 })
ExpenseSchema.index({ cashregisterId: 1 })
ExpenseSchema.index({ cashregisterAccountId: 1 })
ExpenseSchema.index({ categoryIds: 1 })
ExpenseSchema.index({ sourceModel: 1, sourceId: 1 })
ExpenseSchema.index({ createdAt: -1 })

ExpenseCategorySchema.index({ removed: 1 })
ExpenseCategorySchema.index({ priority: 1 })

export const ExpenseModel = mongoose.model<ExpenseDoc>('expense', ExpenseSchema)
export const ExpenseCategoryModel = mongoose.model<ExpenseCategoryDoc>('expense-category', ExpenseCategorySchema)
