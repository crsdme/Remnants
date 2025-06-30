import type { SyncEntry } from '../types/sync-entry.type'
import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

import { uuidValidator } from '../utils/uuidValidator'

const SyncEntrySchema: Schema = new Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
      validate: uuidValidator,
    },
    sourceType: {
      type: String,
      required: true,
      index: true,
    },
    sourceId: {
      type: String,
      required: true,
      index: true,
    },
    site: {
      type: String,
      ref: 'site',
      default: [],
    },
    externalId: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'synced', 'error'],
      default: 'pending',
    },
    syncedAt: {
      type: Date,
    },
    lastError: {
      type: String,
    },
  },
  { timestamps: true },
)

SyncEntrySchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id
    delete ret._id
  },
})

export const SyncEntryModel = mongoose.model<SyncEntry>('sync-entry', SyncEntrySchema)
