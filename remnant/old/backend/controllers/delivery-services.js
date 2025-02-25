const deliveryServiceModel = require('../models/delivery-service.js');
const { createNotification } = require('./notification.js');

const createDeliveryService = async ({ names, type, priority, active = false, userId }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const createdDeliveryService = await deliveryServiceModel.create({ names, type, priority, active });

    if (createdDeliveryService) {
        status = 'success';
        data = createdDeliveryService;
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

const editDeliveryService = async ({ _id, names, type, priority, active = false, userId }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const editedDeliveryService = await deliveryServiceModel.updateOne({ _id }, { names, type, priority, active });

    if (editedDeliveryService) {
        status = 'success';
        data = editedDeliveryService;
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

const getDeliveryServices = async ({ filter, sorter, pagination }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const { current, pageSize, allPages } = (pagination || { current: null, pageSize: null, allPages: null });

    filter = { ...filter, removed: false };

    let query = deliveryServiceModel.find(filter);

    let deliveryServicesCount = await deliveryServiceModel.count();

    if (allPages === false || !allPages) {
        query = query.skip((current - 1) * pageSize).limit(pageSize);
    }

    const deliveryServices = await query.exec();

    if (deliveryServices) {
        status = 'success';
        data = { deliveryServices, deliveryServicesCount };
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

const removeDeliveryService = async ({ _id }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const removedDeliveryService = await deliveryServiceModel.updateOne({ _id }, { removed: true });

    if (removedDeliveryService) {
        status = 'success';
        data = removedDeliveryService;
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
    createDeliveryService,
    getDeliveryServices,
    removeDeliveryService,
    editDeliveryService,
  };
