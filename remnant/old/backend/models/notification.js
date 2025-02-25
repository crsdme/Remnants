const path = require('path');
const mongoose = require('mongoose');

const { Schema } = mongoose;

const generalSchema = new Schema({
  type: {
    type: Schema.Types.String,
    required: true,
    enum: ['alert', 'info', 'warning']
  },
  title: {
    type: Schema.Types.String,
    required: true
  },
  description: {
    type: Schema.Types.String,
    required: true
  },
  number: {
    type: Schema.Types.Number,
  },
  link: {
    type: Schema.Types.String,
  },
  user: {
    type: Schema.Types.String,
    required: true,
    ref: 'user'
  },
  viewed: {
    type: Schema.Types.Boolean,
    default: false,
  },
  timeLeft: {
    type: Schema.Types.Date,
  },
  viewedAt: {
    type: Schema.Types.Date
  },
}, { timestamps: true });

const modelname = path.basename(__filename, '.js');
const model = mongoose.model(modelname, generalSchema);
module.exports = model;
