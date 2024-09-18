const path = require('path');
const mongoose = require('mongoose');

const { Schema } = mongoose;

const generalSchema = new Schema({
    names: {
        ru: { 
            type: String,
        },
        ua: { 
            type: String,
        },
        en: { 
            type: String, 
        },
        tr: { 
            type: String, 
        },
    },
    parent: {
        type: Schema.Types.ObjectId
    },
    priority: {
        type: Schema.Types.Number,
        default: 0
    }
}, { timestamps: true });

const modelname = path.basename(__filename, '.js');
const model = mongoose.model(modelname, generalSchema);
module.exports = model;
