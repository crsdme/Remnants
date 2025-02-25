const currencyModel = require('../models/currency.js');
const { createNotification } = require('./notification.js');

const createCurrency = async ({ names, symbol, code, exchangeRate, main, active, userId }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    if (!main) {
        main = false
    }

    if (!active) {
        active = false
    }

    const createdCurrency = await currencyModel.create({ names, symbol, code, exchangeRate, main, active });

    if (createdCurrency) {
        status = 'success';
        data = createdCurrency;
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

const editCurrency = async ({ _id, names, symbol, code, exchangeRate, main, active, userId }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    if (!main) {
        main = false
    }

    if (!active) {
        active = false
    }

    const editedCurrency = await currencyModel.updateOne({ _id }, { names, symbol, code, exchangeRate, main, active });

    if (editedCurrency) {
        status = 'success';
        data = editedCurrency;
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

    let query = currencyModel.find(filter);

    let currenciesCount = await currencyModel.count();

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

const removeCurrency = async ({ _id }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const removedCurrency = await currencyModel.updateOne({ _id }, { disabled: true });

    if (removedCurrency) {
        status = 'success';
        data = removedCurrency;
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
    createCurrency,
    getCurrencies,
    removeCurrency,
    editCurrency,
  };
