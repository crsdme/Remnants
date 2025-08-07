import type { Inventory, InventoryItem } from '../types/inventories.type'
import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { CounterModel } from './counter.model'

const InventorySchema: Schema = new Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    seq: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['draft', 'confirmed', 'awaiting', 'received', 'cancelled'],
      default: 'draft',
    },
    warehouse: {
      type: String,
      ref: 'Warehouse',
      required: true,
    },
    category: {
      type: String,
      ref: 'Category',
      required: true,
    },
    createdBy: {
      type: String,
      ref: 'User',
      required: true,
    },
    removedBy: {
      type: String,
      ref: 'User',
      default: null,
    },
    comment: {
      type: String,
      default: '',
    },
    removedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
)

const InventoryItemSchema: Schema = new Schema({
  inventoryId: {
    type: String,
    required: true,
    ref: 'Inventory',
  },
  productId: {
    type: String,
    required: true,
    ref: 'Product',
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
  },
  receivedQuantity: {
    type: Number,
    required: true,
    default: 0,
  },
})

InventorySchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id
    delete ret._id
  },
})

InventorySchema.pre('save', async function (next) {
  const doc = this as any

  if (doc.isNew && !doc.seq) {
    const counter = await CounterModel.findByIdAndUpdate(
      'inventories',
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    )
    doc.seq = counter.seq
  }

  next()
})

export const InventoryModel = mongoose.model<Inventory>('inventory', InventorySchema)
export const InventoryItemModel = mongoose.model<InventoryItem>('inventory-item', InventoryItemSchema)
