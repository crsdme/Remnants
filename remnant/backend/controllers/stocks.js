const stockModel = require('../models/stocks.js');
const { createNotification } = require('./notification.js');

const createStock = async ({ names, priority }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const createdStock = await stockModel.create({ names, priority });

    if (createdStock) {
        status = 'success';
        data = createdStock;
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

const editStock = async ({ _id, names, priority }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const editedStock = await stockModel.updateOne({ _id }, { names, priority });

    if (editedStock) {
        status = 'success';
        data = editedStock;
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

const getStocks = async ({ filter, sorter, pagination }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const { current, pageSize, allPages } = (pagination || { current: null, pageSize: null, allPages: null });

    filter = { ...filter, disabled: false };

    let query = stockModel.find(filter);

    let stocksCount = await stockModel.count();

    if (allPages === false || !allPages) {
        query = query.skip((current - 1) * pageSize).limit(pageSize);
    }

    const stocks = await query.exec();

    if (stocks) {
        status = 'success';
        data = { stocks, stocksCount };
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

const removeStock = async ({ _id }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const removedStock = await stockModel.updateOne({ _id }, { disabled: true });

    if (removedStock) {
        status = 'success';
        data = removedStock;
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
    createStock,
    getStocks,
    removeStock,
    editStock,
  };
