const productsModel = require('../models/product.js');

const createProduct = async ({ 
    names, 
    attributeGroup, 
    attributes, 
    images, 
    price, 
    currency, 
    discount, 
    wholesalePrice,
    wholesaleCurrency, 
    barcode, 
    category 
}) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const createdProduct = await productsModel.create({ name, code, main, active });

    if (createdProduct) {
        status = 'success';
        data = createdProduct;
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

const editLanguage = async ({ _id, name, code, main, active }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    if (!main) {
        main = false
    }

    if (!active) {
        active = false
    }

    const editedLanguage = await languageModel.updateOne({ _id }, { name, code, main, active });

    if (editedLanguage) {
        status = 'success';
        data = editedLanguage;

        wsServer.getIo().emit('/updateLanguages', { status: true }); 
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

const getProducts = async ({ filter, sorter, pagination }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const { current, pageSize, allPages } = (pagination || { current: null, pageSize: null, allPages: null });

    let productsQuery = productsModel.find(filter);

    let productsCount = await productsModel.count();

    if (allPages === false || !allPages) {
        productsQuery = productsQuery.skip((current - 1) * pageSize).limit(pageSize);
    }

    const products = await productsQuery.exec();

    if (products) {
        status = 'success';
        data = { products, productsCount };
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

const removeLanguage = async ({ _id }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    console.log(_id)
    const removedLanguage = await languageModel.deleteOne({ _id });

    if (removedLanguage) {
        status = 'success';
        data = removedLanguage;

        wsServer.getIo().emit('/updateLanguages', { status: true }); 
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
    createProduct,
    getProducts,
    removeLanguage,
    editLanguage,
  };
