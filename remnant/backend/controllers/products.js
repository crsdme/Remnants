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
    categories
}) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    if (Array.isArray(categories)) { // MULTI CATEGORY SELECT OPTION
        categories = categories.map(item => ({ _id: item }))
    } else {
        categories = [{ _id: categories }]
    }
    
    names = JSON.parse(names);

    const createdProduct = await productsModel.create({ names, price, currency, wholesalePrice, wholesaleCurrency, categories, images });

    if (createdProduct) {
        status = 'success';
        data = getProduct({ _id: createdProduct._id });
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

const editProduct = async ({
    _id,
    names, 
    attributeGroup, 
    attributes, 
    images,
    fileList,
    price, 
    currency, 
    discount, 
    wholesalePrice,
    wholesaleCurrency, 
    barcode, 
    categories,
    customField
}) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    customField = JSON.parse(customField);

    console.log(customField)
    const product = await productsModel.findOne({ _id });
    
    categories = categories.split(',');

    if (categories.length > 0) {
        if (Array.isArray(categories)) { // MULTI CATEGORY SELECT OPTION
            categories = categories.map(item => ({ _id: item }))
        } else {
            categories = [{ _id: categories }]
        }
    }

    if (!Array.isArray(images)) images = [images];

    if (!Array.isArray(fileList)) fileList = JSON.parse(fileList);

    const oldImages = [];

    let imagesNew = 0;

    fileList.forEach(file => {
        const sameFile = product.images.find(image => JSON.stringify(image._id) === JSON.stringify(file.uid));
        if (sameFile) {
            oldImages.push(sameFile)
        } else {
            oldImages.push(images[imagesNew])
            imagesNew++
        }
    });

    images = oldImages || [];

    names = JSON.parse(names);

    const editedProduct = await productsModel.updateOne(
        { _id }, 
        { 
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
            categories
        }
    );

    if (editedProduct) {
        status = 'success';
        data = editedProduct;
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

    const { current, pageSize, allPages } = (pagination || { current: 1, pageSize: 10, allPages: false });

    let query = { ...filter };

    let pipline = [
        {
            $match: query
        },
        // CURRENIES
        {
            $lookup: {
                from: "currencies",
                localField: "currency",
                foreignField: "_id",
                as: "currency",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            symbol: 1
                        }
                    }
                ]
            },
        },
        {
            $unwind: {
                path: "$currency",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "currencies",
                localField: "wholesaleCurrency",
                foreignField: "_id",
                as: "wholesaleCurrency",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            symbol: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: {
                path: "$wholesaleCurrency",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $addFields: {
                wholesaleCurrency: {
                    $ifNull: ["$wholesaleCurrency", "$currency"]
                }
            }
        },
        // CATEGORY
        {
            $lookup: {
                from: "categories",
                localField: "categories._id",
                foreignField: "_id",
                as: "categories",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            names: 1
                        }
                    }
                ]
            },
        },
    ];

    let productsCount = await productsModel.count(query);

    let productsQuery = productsModel.aggregate(pipline);

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

const getProduct = async ({ _id }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    let query = { _id };

    let pipline = [
        {
            $match: query
        },
        {
            $lookup: {
                from: "currencies",
                localField: "currency",
                foreignField: "_id",
                as: "currency",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            symbol: 1
                        }
                    }
                ]
            },
        },
        {
            $unwind: {
                path: "$currency",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "currencies",
                localField: "wholesaleCurrency",
                foreignField: "_id",
                as: "wholesaleCurrency",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            symbol: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: {
                path: "$wholesaleCurrency",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $addFields: {
                wholesaleCurrency: {
                    $ifNull: ["$wholesaleCurrency", "$currency"]
                }
            }
        }
    ];

    let productQuery = productsModel.aggregate(pipline);

    const product = await productQuery.exec();

    if (product) {
        status = 'success';
        data = product;
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

const removeProduct = async ({ _id }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const removedProduct = await productsModel.deleteOne({ _id });

    if (removedProduct) {
        status = 'success';
        data = removedProduct;
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
    removeProduct,
    editProduct,
    getProduct
};
