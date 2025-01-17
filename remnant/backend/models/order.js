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
    source: {
        type: Schema.Types.ObjectId,
        ref: 'source'
    },
    orderStatus: {
        type: Schema.Types.ObjectId,
        ref: 'order-status'
    },
    deliveryService: {
        type: Schema.Types.ObjectId,
        ref: 'deliveryService'
    },
    client: {
        type: Schema.Types.ObjectId,
        ref: 'client'
    },
    products: [{
        _id: {
            type: Schema.Types.ObjectId,
            ref: 'products'
        },
        quantity: {
            type: Schema.Types.Number,
            default: 1
        },
        price: {
            type: Schema.Types.Number
        },
    }],
    comment: {
        type: Schema.Types.String
    },
    removed: {
        type: Schema.Types.Boolean,
        default: false
    },
}, { timestamps: true });

const modelname = path.basename(__filename, '.js');
const model = mongoose.model(modelname, generalSchema);
module.exports = model;
