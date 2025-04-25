import mongoose, { Schema } from 'mongoose'

export interface UnitInterface {
  names: string
  symbols: string
  main: string
  active: string
  removed: string
}

const UnitSchema: Schema = new Schema(
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
    symbols: {
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

export default mongoose.model<UnitInterface>('Unit', UnitSchema)
