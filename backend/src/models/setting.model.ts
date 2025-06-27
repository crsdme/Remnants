import type { Setting } from '../types/setting.type'
import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { uuidValidator } from '../utils/uuidValidator'

const SettingSchema: Schema = new Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
      validate: uuidValidator,
    },
    key: {
      type: String,
      required: true,
      default: '',
    },
    value: {
      type: String,
      required: true,
      default: '',
    },
    scope: {
      type: String,
      required: true,
      default: '',
    },
    isPublic: {
      type: Boolean,
      required: true,
      default: false,
    },
    description: {
      type: String,
      required: true,
      default: '',
    },
  },
  { timestamps: true },
)

SettingSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id
    delete ret._id
  },
})

SettingSchema.index({ key: 1 })

export const SettingModel = mongoose.model<Setting>('Setting', SettingSchema)
