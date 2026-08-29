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
      enum: ['draft', 'confirmed', 'cancelled'],
      default: 'draft',
    },
    warehouseId: {
      type: String,
      ref: 'Warehouse',
      required: true,
    },
    categoryIds: [{
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
  _id: {
    type: String,
    default: uuidv4,
  },
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
    default: null,
  },
  counted: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true })

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
    const Model = this.constructor as typeof InventoryModel
    const maxDoc = await Model.findOne().sort({ seq: -1 }).select({ seq: 1 }).lean()
    const maxSeq = typeof maxDoc?.seq === 'number' ? maxDoc.seq : 0

    const counter = await CounterModel.findByIdAndUpdate(
      'inventory',
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    )

    if (counter.seq <= maxSeq) {
      const synced = await CounterModel.findByIdAndUpdate(
        'inventory',
        { $set: { seq: maxSeq + 1 } },
        { new: true },
      )
      this.seq = synced?.seq ?? maxSeq + 1
    }
    else {
      this.seq = counter.seq
    }
  }
  next()
})

InventorySchema.index({ removed: 1, seq: -1 })
InventorySchema.index({ warehouseId: 1, removed: 1 })
InventorySchema.index({ status: 1 })
InventorySchema.index({ categoryIds: 1 })
InventorySchema.index({ createdAt: -1 })

InventoryItemSchema.index({ inventoryId: 1 })
InventoryItemSchema.index({ productId: 1 })
InventoryItemSchema.index({ inventoryId: 1, productId: 1 }, { unique: true })

export const InventoryModel = mongoose.model<InventoryDoc>('inventory', InventorySchema)
export const InventoryItemModel = mongoose.model<InventoryItemDoc>('inventory-item', InventoryItemSchema)
