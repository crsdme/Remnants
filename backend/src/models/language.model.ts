import mongoose, { Schema } from 'mongoose'

export interface Language {
  name: string
  code: string
  priority: number
  main: boolean
  active: boolean
  removed: boolean
  createdAt: Date
  updatedAt: Date
}

const LanguageSchema: Schema = new Schema(
  {
    name: {
      type: Schema.Types.String,
      required: true,
    },
    code: {
      type: Schema.Types.String,
      required: true,
    },
    main: {
      type: Schema.Types.Boolean,
      required: true,
    },
    priority: {
      type: Schema.Types.Number,
      default: 0,
    },
    active: {
      type: Schema.Types.Boolean,
      default: true,
    },
    removed: {
      type: Schema.Types.Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

const LanguageModel = mongoose.model<Language>('Language', LanguageSchema)

export { LanguageModel }
