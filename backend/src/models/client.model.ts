import type { Client } from '../types/client.type'
import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { uuidValidator } from '../utils/uuidValidator'

const ClientSchema: Schema = new Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
      validate: uuidValidator,
    },
    name: {
      type: String,
      required: true,
    },
    middleName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    emails: [{
      type: String,
    }],
    phones: [{
      type: String,
    }],
    addresses: [{
      type: String,
    }],
    comment: {
      type: String,
    },
    removed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

ClientSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.removed
  },
})

export const ClientModel = mongoose.model<Client>('Client', ClientSchema)
