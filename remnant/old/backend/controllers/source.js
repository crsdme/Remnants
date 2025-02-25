const sourceModel = require('../models/source.js');
const { createNotification } = require('./notification.js');

const createSource = async ({ names, priority }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const createdSource = await sourceModel.create({ names, priority });

    if (createdSource) {
        status = 'success';
        data = createdSource;
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

const editSource = async ({ _id, names, priority, userId }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const editedSource = await sourceModel.updateOne({ _id }, { names, priority });

    if (editedSource) {
        status = 'success';
        data = editedSource;
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

const getSources = async ({ filter, sorter, pagination }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const { current, pageSize, allPages } = (pagination || { current: null, pageSize: null, allPages: null });

    filter = { ...filter, disabled: false };

    let query = sourceModel.find(filter);

    let sourcesCount = await sourceModel.count();

    if (allPages === false || !allPages) {
        query = query.skip((current - 1) * pageSize).limit(pageSize);
    }

    const sources = await query.exec();

    if (sources) {
        status = 'success';
        data = { sources, sourcesCount };
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

const removeSource = async ({ _id }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const removedSource = await sourceModel.updateOne({ _id }, { disabled: true });

    if (removedSource) {
        status = 'success';
        data = removedSource;
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
    createSource,
    getSources,
    removeSource,
    editSource,
  };
