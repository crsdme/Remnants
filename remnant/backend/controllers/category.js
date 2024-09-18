const categoryModel = require('../models/category.js');

const createCategory = async ({ names, parent, priority, userId }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const createdCategory = await categoryModel.create({ names, parent, priority });

    if (createdCategory) {
        status = 'success';
        data = createdCategory;
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

const editCategory = async ({ _id, names, parent, priority }) => {
    let status = null
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const editedCategory = await categoryModel.updateOne({ _id }, { names, parent, priority });

    if (editedCategory) {
        status = 'success';
        data = editedCategory; 
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

const getCategories = async ({ filter, sorter, pagination }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const { current, pageSize, allPages } = (pagination || { current: null, pageSize: null, allPages: null });

    let categoriesQuery = categoryModel.find();

    let categoriesCount = await categoryModel.count();

    if (allPages === false || !allPages) {
        categoriesQuery = categoriesQuery.skip((current - 1) * pageSize).limit(pageSize);
    }

    const categories = await categoriesQuery.exec();

    if (categories) {
        status = 'success';
        data = { categories, categoriesCount };
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

const removeCategory = async ({ _id }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const removedCategory = await categoryModel.deleteOne({ _id });

    if (removedCategory) {
        status = 'success';
        data = removedCategory; 
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
    createCategory,
    getCategories,
    removeCategory,
    editCategory,
  };
