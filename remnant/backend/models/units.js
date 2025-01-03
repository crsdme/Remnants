const path = require('path');
const mongoose = require('mongoose');

const { Schema } = mongoose;

const generalSchema = new Schema({
  names: {
    type: Map,
    of: String,
    validate: {
        validator: function(value) {
            const allowedLanguages = ['ru', 'en'];
            return Array.from(value.keys()).every(key => allowedLanguages.includes(key));
        },
        message: 'ru en keys only'
    }
  },
  symbol: {
    type: Schema.Types.String,
    required: true
  },
  active: {
    type: Schema.Types.Boolean
  },
  priority: {
    type: Schema.Types.Number,
    default: 0
  },
  disabled: {
    type: Schema.Types.Boolean,
    default: false
  },
}, { timestamps: true });

const modelname = path.basename(__filename, '.js');
const model = mongoose.model(modelname, generalSchema);
module.exports = model;
