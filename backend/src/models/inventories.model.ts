import type { HydratedDocument } from 'mongoose'
import type { InventoryDB, InventoryItemDB } from '@/types/'
import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

import { CounterModel } from '@/models/'

type InventoryDoc = HydratedDocument<InventoryDB>
type InventoryItemDoc = HydratedDocument<InventoryItemDB>

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
    categoriesIds: [{
      type: String,
      ref: 'Category',
      required: true,
    }],
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
    removed: {
      type: Boolean,
      default: false,
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

InventorySchema.pre('save', async function (this: InventoryDoc, next) {
  if (this.isNew) {
    const counter = await CounterModel.findByIdAndUpdate(
      'inventory',
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    )
    this.seq = counter.seq
  }
  next()
})

export const InventoryModel = mongoose.model<InventoryDoc>('inventory', InventorySchema)
export const InventoryItemModel = mongoose.model<InventoryItemDoc>('inventory-item', InventoryItemSchema)
