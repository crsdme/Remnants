import type { HydratedDocument } from 'mongoose'
import type { WorkShiftDB } from '@/types'
import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { uuidValidator } from '@/utils/'

type WorkShiftDoc = HydratedDocument<WorkShiftDB>

const WorkScheduleSchema = new Schema({
  start: { type: String, required: true },
  end: { type: String, required: true },
}, { _id: false })

const WorkShiftSchema: Schema = new Schema(
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
    workDate: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['planned', 'started', 'completed', 'absent'],
      required: true,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    finishedAt: {
      type: Date,
      default: null,
    },
    plannedSchedule: {
      type: WorkScheduleSchema,
      default: null,
    },
    earlyBonusMinor: {
      type: Number,
      default: 0,
    },
    latePenaltyMinor: {
      type: Number,
      default: 0,
    },
    salaryMinor: {
      type: Number,
      default: 0,
    },
    markedByUserId: {
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

WorkShiftSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.removed
  },
})

WorkShiftSchema.index({ userId: 1, workDate: 1 }, { unique: true, partialFilterExpression: { removed: false } })
WorkShiftSchema.index({ userId: 1, status: 1 })
WorkShiftSchema.index({ removed: 1 })

export const WorkShiftModel = mongoose.model<WorkShiftDoc>('work-shift', WorkShiftSchema, 'work-shifts')
