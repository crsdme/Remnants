import type { UserRole } from '../types/user-role.type'
import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { SUPPORTED_LANGUAGES } from '../config/constants'
import { uuidValidator } from '../utils/uuidValidator'

const UserRoleSchema: Schema = new Schema(
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
        message: 'ru en keys only',
      },
    },
    permissions: {
      type: [String],
      required: true,
      default: [],
    },
    priority: {
      type: Number,
      required: true,
      default: 0,
    },
    active: {
      type: Boolean,
      required: true,
      default: true,
    },
    removed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

UserRoleSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.removed
  },
})

export const UserRoleModel = mongoose.model<UserRole>('user-role', UserRoleSchema)
