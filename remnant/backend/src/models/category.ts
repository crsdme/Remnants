import mongoose, { Schema } from 'mongoose'

export interface CategoryInterface {
  _id: Schema.Types.ObjectId
  names: object
  parent: Schema.Types.ObjectId
  priority: number
  removed: string
}

const CategorySchema: Schema = new Schema(
  {
    names: {
      type: Map,
      of: String,
      required: true,
      validate: {
        validator(value: Map<string, string>) {
          const allowedLanguages = ['ru', 'en']
          return Array.from(value.keys()).every(key =>
            allowedLanguages.includes(key),
          )
        },
        message: 'ru en keys only',
      },
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'category',
    },
    priority: {
      type: Number,
      default: 0,
    },
    removed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

export default mongoose.model<CategoryInterface>('Category', CategorySchema)
