const quantityModel = require('../models/quantity.js');
const productModel = require('../models/product.js');

const createQuantity = async ({ product, amount, stock }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const createdQuantity = await quantityModel.create({ product, amount, stock, status: "Discontinued" });

    if (createdQuantity) {
        status = 'success';
        data = createdQuantity;
    } else {
        status = 'failed';
    }

    return {
        status, 
        data, 
        errors,
        warnings,
        info
    };
}

const countQuantity = async ({ type, product, amount, stock }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    if (type === 'dec') {
        amount = amount * -1; 
    }

    let editedQuantity = await quantityModel.findOneAndUpdate({ product, stock }, { $inc: { amount } });
    
    if (editedQuantity.matchedCount === 0) {
        editedQuantity = await quantityModel.create({ product, stock, amount });
    }
    console.log(editedQuantity)
    await productModel.updateOne({ _id: product }, { $push: { quantity: editedQuantity._id } });
    
    if (editedQuantity) {
        status = 'success';
        data = editedQuantity;
    } else {
        status = 'failed';
    }   

    return {
        status, 
        data, 
        errors,
        warnings,
        info
    };
}

const getCurrencies = async ({ filter, sorter, pagination }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const { current, pageSize, allPages } = (pagination || { current: null, pageSize: null, allPages: null });

    filter = { ...filter, disabled: false };

    let query = quantityModel.find(filter);

    let currenciesCount = await quantityModel.count();

    if (allPages === false || !allPages) {
        query = query.skip((current - 1) * pageSize).limit(pageSize);
    }

    const currencies = await query.exec();

    if (currencies) {
        status = 'success';
        data = { currencies, currenciesCount };
    } else {
        status = 'failed';
    }

    return {
        status, 
        data, 
        errors,
        warnings,
        info
    };
}

module.exports = {
    countQuantity,
  };
