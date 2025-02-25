const orderStatusModel = require('../models/order-status.js');

const createOrderStatus = async ({ names, color, priority, userId }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const createdStatus = await orderStatusModel.create({ names, color, priority });

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

const editOrderStatus = async ({ _id, names, color, priority, userId }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const editedStatus = await orderStatusModel.updateOne({ _id }, { names, color, priority });

    if (editedStatus) {
        status = 'success';
        data = editedStatus;
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

const getOrderStatuses = async ({ filter, sorter, pagination }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const { current, pageSize, allPages } = (pagination || { current: null, pageSize: null, allPages: null });

    filter = { ...filter, disabled: false };

    let query = orderStatusModel.find(filter);

    let orderStatusesCount = await orderStatusModel.count();

    if (allPages === false || !allPages) {
        query = query.skip((current - 1) * pageSize).limit(pageSize);
    }

    const orderStatuses = await query.exec();

    if (orderStatuses) {
        status = 'success';
        data = { orderStatuses, orderStatusesCount };
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

const removeOrderStatus = async ({ _id }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const removedStatus = await orderStatusModel.updateOne({ _id }, { disabled: true });

    if (removedStatus) {
        status = 'success';
        data = removedStatus;
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
    createOrderStatus,
    getOrderStatuses,
    removeOrderStatus,
    editOrderStatus,
  };
