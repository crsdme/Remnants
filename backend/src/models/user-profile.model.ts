import type { HydratedDocument } from 'mongoose'
import type { UserProfileDB } from '@/types'
import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { uuidValidator } from '@/utils/'

type UserProfileDoc = HydratedDocument<UserProfileDB>

const BonusRuleSchema = new Schema({
  enabled: { type: Boolean, default: false },
  amountMinor: { type: Number, default: 0 },
  graceMinutes: { type: Number, default: 0 },
}, { _id: false })

const SalarySettingsSchema = new Schema({
  amountMinor: { type: Number, default: 0 },
  currencyId: { type: String, ref: 'Currency', default: null },
  mode: {
    type: String,
    enum: ['per_shift', 'calendar_period', 'worked_shifts_period'],
    default: 'per_shift',
  },
  periodDays: { type: Number },
  periodShifts: { type: Number },
  minWorkedShiftsToAccrue: { type: Number, default: 0 },
  periodAnchor: {
    type: String,
    enum: ['hiredAt', 'monthStart'],
    default: 'hiredAt',
  },
}, { _id: false })

const WorkScheduleSchema = new Schema({
  start: { type: String, required: true },
  end: { type: String, required: true },
}, { _id: false })

const UserProfileSchema: Schema = new Schema(
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
      unique: true,
    },
    hiredAt: {
      type: Date,
      default: null,
    },
    defaultSchedule: {
      type: WorkScheduleSchema,
      default: null,
    },
    utcOffset: {
      type: String,
      default: '+03:00',
    },
    salary: {
      type: SalarySettingsSchema,
      default: () => ({
        amountMinor: 0,
        mode: 'per_shift',
        minWorkedShiftsToAccrue: 0,
        periodAnchor: 'hiredAt',
      }),
    },
    earlyBonus: {
      type: BonusRuleSchema,
      default: () => ({ enabled: false, amountMinor: 0, graceMinutes: 0 }),
    },
    latePenalty: {
      type: BonusRuleSchema,
      default: () => ({ enabled: false, amountMinor: 0, graceMinutes: 0 }),
    },
    removed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

UserProfileSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.removed
  },
})

UserProfileSchema.index({ userId: 1 }, { unique: true })
UserProfileSchema.index({ removed: 1 })

export const UserProfileModel = mongoose.model<UserProfileDoc>('user-profile', UserProfileSchema, 'user-profiles')
