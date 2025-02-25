const unitsModel = require('../models/units.js');
const { removeCustomFieldOption } = require('./custom-field-option.js');
const { createNotification } = require('./notification.js');

const createUnit = async ({ names, symbol, priority, active, userId }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    if (!active) {
        active = false
    }

    const createdUnit = await unitsModel.create({ names, symbol, priority, active });

    if (createdUnit) {
        status = 'success';
        data = createdUnit;
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

const editUnit = async ({ _id, names, symbol, priority, active, userId }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    if (!active) {
        active = false
    }

    const editedUnit = await unitsModel.updateOne({ _id }, { names, symbol, priority, active });

    if (editedUnit) {
        status = 'success';
        data = editedUnit;
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

const getUnits = async ({ filter, sorter, pagination }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const { current, pageSize, allPages } = (pagination || { current: null, pageSize: null, allPages: null });

    filter = { ...filter, disabled: false };

    let query = unitsModel.find(filter);

    let unitsCount = await unitsModel.count();

    if (allPages === false || !allPages) {
        query = query.skip((current - 1) * pageSize).limit(pageSize);
    }

    const units = await query.exec();

    if (units) {
        status = 'success';
        data = { units, unitsCount };
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

const removeUnit = async ({ _id }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const removedUnit = await unitsModel.updateOne({ _id }, { disabled: true });

    if (removedUnit) {
        status = 'success';
        data = removedUnit;
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
    createUnit,
    getUnits,
    removeUnit,
    editUnit,
  };
