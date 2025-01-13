const purchaseModel = require('../models/purchase.js');

const { countQuantity } = require('./quantity.js');

const createPurchase = async ({ stock, toStock, type, comment, products }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const purchaseStatuses = {
        add: 'accepted',
        remove: 'removed',
        move: 'awaiting'
    }

    const purchaseTypes = {
        add: 'add',
        remove: 'dec',
        move: 'dec'
    }

    const purchaseCount = await purchaseModel.count();

    const createdPurchase = await purchaseModel.create({ 
        id: purchaseCount + 1,
        status: purchaseStatuses[type], 
        stock, 
        toStock, 
        type, 
        comment, 
        products 
    });

    for (const product of products) {
        countQuantity({ type: purchaseTypes[type], product: product._id, amount: product.quantity, stock });
    }

    if (createdPurchase) {
        status = 'success';
        data = createdPurchase;
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

const editPurchase = async ({ _id, stock, type, comment, products }) => {
    let status = null
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const editedPurchase = await purchaseModel.findOneAndUpdate({ _id }, { stock, type, comment, products }, { new: true });

    if (editedPurchase) {
        status = 'success';
        data = editedPurchase; 
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

const getPurchases = async ({ filter, sorter, pagination }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const { current, pageSize, allPages } = (pagination || { current: 1, pageSize: 10, allPages: false });

    const { code, single } = (filter || { code: null, single: false });

    let query = {};

    let pipline = [
        {
            $match: query
        }
    ];

    let purchasesQuery = purchaseModel.aggregate(pipline);

    if (allPages === false || !allPages) {
        purchasesQuery = purchasesQuery.skip((current - 1) * pageSize).limit(pageSize);
    }

    let purchases = await purchasesQuery.exec();

    const purchasesCount = await purchaseModel.count(query);

    if (purchases) {
        status = 'success';
        data = { purchases, purchasesCount };
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

const getPurchaseProducts = async ({ filter, sorter, pagination }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const { current, pageSize, allPages } = (pagination || { current: 1, pageSize: 10, allPages: false });

    const { code, single } = (filter || { code: null, single: false });

    let query = {};

    let pipline = [
        {
            $match: query
        }
    ];

    let purchasesQuery = purchaseModel.aggregate(pipline);

    if (allPages === false || !allPages) {
        purchasesQuery = purchasesQuery.skip((current - 1) * pageSize).limit(pageSize);
    }

    let purchases = await purchasesQuery.exec();

    const purchasesCount = await purchaseModel.count(query);

    if (purchases) {
        status = 'success';
        data = { purchases, purchasesCount };
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

const removePurchase = async ({ _id }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const removedPurchase = await purchaseModel.deleteOne({ _id });

    if (removedPurchase) {
        status = 'success';
        data = removedPurchase; 
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
    createPurchase,
    getPurchases,
    removePurchase,
    editPurchase,
    getPurchaseProducts
  };














