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
    parent: {
        type: Schema.Types.ObjectId,
        ref: 'category'
    },
    priority: {
        type: Schema.Types.Number,
        default: 0
    }
}, { timestamps: true });

const modelname = path.basename(__filename, '.js');
const model = mongoose.model(modelname, generalSchema);
module.exports = model;
