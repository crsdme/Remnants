import type { Document } from 'mongoose'
import mongoose, { Schema } from 'mongoose'

export interface User extends Document {
  login: string
  password: string
  name: string
  active: boolean
}

const UserSchema: Schema = new Schema(
  {
    login: {
      type: String,
      required: true,
      unique: true,
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

const UserModel = mongoose.model<User>('User', UserSchema)

export { UserModel }
