import type { Document } from 'mongoose'
import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

export interface User extends Document {
  _id: string
  login: string
  password: string
  name: string
  active: boolean
  createdAt: Date
  updatedAt: Date
}

const UserSchema: Schema = new Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    login: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
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

UserSchema.index(
  { login: 1 },
  { unique: true, partialFilterExpression: { removed: false } },
)

const UserModel = mongoose.model<User>('User', UserSchema)

export { UserModel }
