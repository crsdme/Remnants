import type { Automation } from '../types/automation.type'
import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { uuidValidator } from '../utils/uuidValidator'

const TriggerSchema = new Schema({
  type: {
    type: String,
    enum: [
      'order-status-updated',
      'order-created',
      'order-updated',
      'order-removed',
    ],
    required: true,
  },
  params: [{
    type: String,
  }],
}, { _id: false })

const ConditionSchema = new Schema({
  field: {
    type: String,
    required: true,
  },
  operator: {
    type: String,
    enum: ['eq', 'ne', 'lt', 'lte', 'gt', 'gte', 'contains', 'not-contains'],
    required: true,
  },
  params: {
    type: Schema.Types.Mixed,
    required: true,
  },
}, { _id: false })

const ActionSchema = new Schema({
  field: {
    type: String,
    enum: ['order-status-update'],
    required: true,
  },
  params: {
    type: Schema.Types.Mixed,
    default: {},
  },
}, { _id: false })

const AutomationSchema: Schema = new Schema(
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
    trigger: {
      type: TriggerSchema,
      required: true,
    },
    conditions: {
      type: [ConditionSchema],
      required: true,
    },
    actions: {
      type: [ActionSchema],
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    removed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

AutomationSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.removed
  },
})

export const AutomationModel = mongoose.model<Automation>('automation', AutomationSchema)
