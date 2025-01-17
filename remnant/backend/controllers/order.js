const orderModel = require('../models/order.js');

const createOrder = async ({ stock, source, products, comment, orderStatus, deliveryService, client, userId }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const id = await orderModel.count();

    const createdStatus = await orderModel.create({ 
        id: id + 1, 
        stock, 
        source, 
        products, 
        comment, 
        orderStatus, 
        deliveryService, 
        client 
    });

    if (createdStatus) {
        status = 'success';
        data = createdStatus;
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

const editOrder = async ({ _id, stock, source, products, comment, orderStatus, deliveryType, client, userId }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const editedOrder = await orderModel.updateOne({ _id }, { stock, source, products, comment, orderStatus, deliveryType, client, });

    if (editedOrder) {
        status = 'success';
        data = editedOrder;
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

const getOrders = async ({ filter, sorter, pagination }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const { current, pageSize, allPages } = (pagination || { current: null, pageSize: null, allPages: null });

    filter = { ...filter, removed: false };

    let query = orderModel.find(filter);

    let ordersCount = await orderModel.count();

    if (allPages === false || !allPages) {
        query = query.skip((current - 1) * pageSize).limit(pageSize);
    }

    const orders = await query.exec();

    if (orders) {
        status = 'success';
        data = { orders, ordersCount };
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

const removeOrder = async ({ _id }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const removedOrder = await orderModel.updateOne({ _id }, { removed: true });

    if (removedOrder) {
        status = 'success';
        data = removedOrder;
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
    createOrder,
    getOrders,
    removeOrder,
    editOrder,
  };
