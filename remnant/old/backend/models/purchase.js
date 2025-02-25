const path = require('path');
const mongoose = require('mongoose');

const { Schema } = mongoose;

const generalSchema = new Schema({
    id: {
        type: Schema.Types.Number
    },
    stock: {
        type: Schema.Types.ObjectId,
        ref: 'stock'
    },
    toStock: {
        type: Schema.Types.ObjectId,
        ref: 'stock'
    },
    status: {
        type: Schema.Types.String,
        num: ['accepted', 'awaiting', 'removed']
    },
    type: {
        type: Schema.Types.String,
        num: ['add', 'remove', 'move']
    },
    comment: {
        type: Schema.Types.String
    },
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
}, { timestamps: true });

const modelname = path.basename(__filename, '.js');
const model = mongoose.model(modelname, generalSchema);
module.exports = model;
