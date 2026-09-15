import type { HydratedDocument } from 'mongoose'
import type { PayrollEntryDB } from '@/types'
import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { uuidValidator } from '@/utils/'

type PayrollEntryDoc = HydratedDocument<PayrollEntryDB>

const PayrollEntrySchema: Schema = new Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
      validate: uuidValidator,
    },
    userId: {
      type: String,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['salary', 'early_bonus', 'late_penalty', 'adjustment'],
      required: true,
    },
    workDate: {
      type: String,
      required: true,
    },
    minorAmount: {
      type: Number,
      required: true,
    },
    currencyId: {
      type: String,
      ref: 'Currency',
    },
    workShiftId: {
      type: String,
      ref: 'work-shift',
    },
    periodStart: {
      type: String,
    },
    periodEnd: {
      type: String,
    },
    comment: {
      type: String,
      default: '',
    },
    createdBy: {
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

PayrollEntrySchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.removed
  },
})

PayrollEntrySchema.index({ userId: 1, workDate: 1 })
PayrollEntrySchema.index({ userId: 1, type: 1 })
PayrollEntrySchema.index({ workShiftId: 1 })
PayrollEntrySchema.index({ removed: 1 })

export const PayrollEntryModel = mongoose.model<PayrollEntryDoc>('payroll-entry', PayrollEntrySchema, 'payroll-entries')
