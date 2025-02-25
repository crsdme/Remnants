const path = require('path');
const mongoose = require('mongoose');

const { Schema } = mongoose;

const generalSchema = new Schema({
  login: {
    type: Schema.Types.String,
    required: true
  },
  password: {
    type: Schema.Types.String,
    required: true
  },
  name: {
    type: Schema.Types.String,
    default: 'User'
  },
  email: {
    type: Schema.Types.String
  },
  role: {
    type: Schema.Types.String,
    default: 'manager',
    enum: ["manager", "director", 'administrator']
  },
  phoneNumber: {
    type: Schema.Types.String
  },
  stocks: [{
    _id: {
      type: Schema.Types.ObjectId
    }
  }],
  sites: [{
    _id: {
      type: Schema.Types.ObjectId
    }
  }],
  cashregisters: [{
    _id: {
      type: Schema.Types.ObjectId
    }
  }],
  access: [{
    type: Schema.Types.String
  }],
  
  
}, { timestamps: true });


const modelname = path.basename(__filename, '.js');
const model = mongoose.model(modelname, generalSchema);
module.exports = model;
