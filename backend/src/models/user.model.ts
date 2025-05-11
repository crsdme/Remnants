import type { Document } from 'mongoose'
import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { CounterModel } from './counter.model'

export interface User extends Document {
  _id: string
  login: string
  password?: string
  name: string
  active: boolean
  createdAt: Date
  updatedAt: Date

  removeSensitiveData: (options: { exclude?: string[] }) => any
}

const UserSchema: Schema = new Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    seq: {
      type: Number,
      default: 0,
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

UserSchema.virtual('id').get(function () {
  return this._id
})

UserSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.removed
  },
})

UserSchema.pre('save', async function (next) {
  const doc = this as any

  if (doc.isNew && !doc.seq) {
    const counter = await CounterModel.findByIdAndUpdate(
      'users',
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    )
    doc.seq = counter.seq
  }

  next()
})

UserSchema.methods.removeSensitiveData = function (options: { exclude?: string[] } = {}) {
  const user = this.toJSON()
  const fieldsToRemove = [...(options.exclude || [])]

  for (const key of fieldsToRemove) {
    delete user[key]
  }

  return user
}

const UserModel = mongoose.model<User>('User', UserSchema)

export { UserModel }
