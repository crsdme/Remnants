import mongoose, { Schema } from 'mongoose'

export interface LanguageInterface {
  name: string
  code: string
  main: string
  active: string
  removed: string
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

export default mongoose.model<LanguageInterface>('Language', LanguageSchema)
