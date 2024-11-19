const customFieldModel = require('../models/custom-field.js');

const createCustomField = async ({ names, model, is_multiple, type, priority, options }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const createdCustomField = await customFieldModel.create({ names, model, is_multiple, type, priority, options });

    if (createdCustomField) {
        status = 'success';
        data = createdCustomField;
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

const editCustomField = async ({ _id, model, names, is_multiple, type, priority, options }) => {
    let status = null
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    console.log(options)

    const editedCustomField = await customFieldModel.findOneAndUpdate({ _id }, { names, model, is_multiple, type, priority, options }, { new: true });

    if (editedCustomField) {
        status = 'success';
        data = editedCustomField; 
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

const getCustomFields = async ({ filter, sorter, pagination }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const { current, pageSize, allPages } = (pagination || { current: 1, pageSize: 10, allPages: false });

    const { name, language } = (filter || { name: null, language: null });

    let query = { parent: { $eq: null } };

    let pipline = [
        {
            $match: query
        },
        {
            $lookup: {
                from: 'custom-field-options',
                localField: 'options',
                foreignField: '_id',
                as: 'options'
            }
        },
        {
            $sort: { priority: 1 }
        },
    ];

    if (name && language) {
        pipline.push({
            $match: { 
                [`names.${language}`]: { $regex: name, $options: 'i' } 
            }
        })
    }

    let customFieldsQuery = customFieldModel.aggregate(pipline);

    if (allPages === false || !allPages) {
        customFieldsQuery = customFieldsQuery.skip((current - 1) * pageSize).limit(pageSize);
    }

    let customFields = await customFieldsQuery.exec();


    const customFieldsCount = await customFieldModel.count(query);

    if (customFields) {
        status = 'success';
        data = { customFields, customFieldsCount };
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

const removeCustomField = async ({ _id }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const removedCustomField = await customFieldModel.deleteOne({ _id });

    if (removedCustomField) {
        status = 'success';
        data = removedCustomField; 
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
    createCustomField,
    getCustomFields,
    removeCustomField,
    editCustomField,
  };














