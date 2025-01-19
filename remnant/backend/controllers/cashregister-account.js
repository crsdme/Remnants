const cashregisterAccountModel = require('../models/cashregister-account.js');
const { createNotification } = require('./notification.js');
const { addCashregisterAccount } = require('./cashregister.js');

const createCashregisterAccount = async ({ names, currencies, cashregister, priority }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    currencies = currencies.map(item => ({ currency: item, amount: 0 }))

    const createdCashregisterAccount = await cashregisterAccountModel.create({ names, cashregister, balance: currencies, priority });

    addCashregisterAccount({ cashregister, account: createdCashregisterAccount._id });

    if (createdCashregisterAccount) {
        status = 'success';
        data = createdCashregisterAccount;
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

const editCashregisterAccount = async ({ _id, names, currencies, cashregister, priority }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const editedCashregisterAccount = await cashregisterAccountModel.updateOne({ _id }, { names, cashregister, priority });

    if (editedCashregisterAccount) {
        status = 'success';
        data = editedCashregisterAccount;
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

const getCashregisterAccounts = async ({ filter, sorter, pagination }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const { current, pageSize, allPages } = (pagination || { current: 1, pageSize: 10, allPages: null });

    const { cashregister } = (filter || { cashregister: null });

    filter = { removed: false };

    if (cashregister) {
        filter.cashregister = cashregister;
    }
    
    let query = cashregisterAccountModel.find(filter);

    let cashregisterAccountsCount = await cashregisterAccountModel.count();

    if (allPages === false || !allPages) {
        query = query.skip((current - 1) * pageSize).limit(pageSize);
    }

    const cashregisterAccounts = await query.exec();

    if (cashregisterAccounts) {
        status = 'success';
        data = { cashregisterAccounts, cashregisterAccountsCount };
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

const removeCashregisterAccount = async ({ _id }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const removedCashregisterAccount = await cashregisterAccountModel.updateOne({ _id }, { removed: true });

    if (removedCashregisterAccount) {
        status = 'success';
        data = removedCashregisterAccount;
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

const countMoneyCashregisterAccount = async ({ type, cashregister, cashregisterAccount, currency, amount }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    if (type === 'dec') {
        amount = amount * -1; 
    }

    let editedCashregisterAccount = await cashregisterAccountModel.findOneAndUpdate(
        { _id: cashregisterAccount, "balance.currency": currency }, 
        { $inc: { 'balance.$.amount': amount } }
    );
    
    if (editedCashregisterAccount) {
        status = 'success';
        data = editedCashregisterAccount;
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
    createCashregisterAccount,
    getCashregisterAccounts,
    removeCashregisterAccount,
    editCashregisterAccount,
    countMoneyCashregisterAccount
  };
