import type { HydratedDocument } from 'mongoose'
import type { ClientDB } from '@/types/'
import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { CounterModel } from '@/models/'
import { uuidValidator } from '@/utils/'

type ClientDoc = HydratedDocument<ClientDB>

const ClientSchema: Schema = new Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
      validate: uuidValidator,
    },
    seq: {
      type: Number,
      default: 0,
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
    country: {
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
    socials: [{
      type: {
        type: String,
        required: true,
      },
      value: {
        type: String,
        required: true,
      },
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

ClientSchema.pre('save', async function (this: ClientDoc, next) {
  if (this.isNew && !this.seq) {
    const counter = await CounterModel.findByIdAndUpdate(
      'clients',
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    )
    this.seq = counter.seq
  }

  next()
})

ClientSchema.index({ removed: 1, seq: 1 })
ClientSchema.index({ phones: 1 })
ClientSchema.index({ emails: 1 })
ClientSchema.index({ createdAt: -1 })

export const ClientModel = mongoose.model<ClientDB>('client', ClientSchema)
