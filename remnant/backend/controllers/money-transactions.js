const moneyTransactionsModel = require('../models/money-transaction.js');
const { createNotification } = require('./notification.js');
const { countMoneyCashregisterAccount } = require('./cashregister-account.js');

const createMoneyTransaction = async ({ to, from, exchangeRate, paymentDate, comment, userId }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const createdMoneyTransaction = await moneyTransactionsModel.create({ to, from, exchangeRate, paymentDate, comment });

    countMoneyCashregisterAccount({
        type: 'inc',
        cashregister: to.cashregister, 
        cashregisterAccount: to.cashregisterAccount, 
        currency: to.currency, 
        amount: to.amount
    });

    if (createdMoneyTransaction) {
        status = 'success';
        data = createdMoneyTransaction;
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

const editMoneyTransaction = async ({ to, from, exchangeRate, paymentDate, comment, userId }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const editedMoneyTransaction = await moneyTransactionsModel.updateOne({ _id }, { to, from, exchangeRate, paymentDate, comment });

    if (editedMoneyTransaction) {
        status = 'success';
        data = editedMoneyTransaction;
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

const getMoneyTransactions = async ({ filter, sorter, pagination }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const { current, pageSize, allPages } = (pagination || { current: null, pageSize: null, allPages: null });

    filter = { ...filter, removed: false };

    let query = moneyTransactionsModel.find(filter);

    let moneyTransactionsCount = await moneyTransactionsModel.count();

    if (allPages === false || !allPages) {
        query = query.skip((current - 1) * pageSize).limit(pageSize);
    }

    const moneyTransactions = await query.exec();

    if (currencies) {
        status = 'success';
        data = { moneyTransactions, moneyTransactionsCount };
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

const removeMoneyTransaction = async ({ _id }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const removedMoneyTransaction = await moneyTransactionsModel.updateOne({ _id }, { removed: true });

    if (removedMoneyTransaction) {
        status = 'success';
        data = removedMoneyTransaction;
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
    createMoneyTransaction,
    getMoneyTransactions,
    removeMoneyTransaction,
    editMoneyTransaction,
  };
