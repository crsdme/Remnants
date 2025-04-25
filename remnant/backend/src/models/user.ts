import type { Document } from 'mongoose'
import mongoose, { Schema } from 'mongoose'

export interface IUser extends Document {
  login: string
  password: string
}

const UserSchema: Schema = new Schema(
  {
    login: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true },
)

export default mongoose.model<IUser>('User', UserSchema)
