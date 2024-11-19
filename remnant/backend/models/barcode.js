const path = require('path');
const mongoose = require('mongoose');

const { Schema } = mongoose;

const generalSchema = new Schema({
    products: [{
        _id: {
            type: Schema.Types.ObjectId,
            ref: 'products'
        },
        quantity: {
            type: Schema.Types.Number,
            default: 1
        }
    }],
    code: {
        type: Schema.Types.String
    }
}, { timestamps: true });

const modelname = path.basename(__filename, '.js');
const model = mongoose.model(modelname, generalSchema);
module.exports = model;
