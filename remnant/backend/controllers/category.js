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

    if (!parent) parent = null;

    const editedCategory = await categoryModel.findOneAndUpdate({ _id }, { names, parent, priority }, { new: true });

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

    const { current, pageSize, allPages } = (pagination || { current: 1, pageSize: 10, allPages: false });

    const { name, language } = (filter || { name: null, language: null });

    let query = { parent: { $eq: null } };

    // if (name) query = { ...query, [`names.${language}`]: { $regex: name, $options: 'i' } } 

    let pipline = [
        {
            $match: query
        },
        {
            $sort: { priority: 1 }
        },
        {
            $graphLookup: {
                from: "categories",
                startWith: "$_id",
                connectFromField: "_id",
                connectToField: "parent",
                as: "children",
                depthField: "level"
            }
        },
        {
            $addFields: {
                children: { 
                    $sortArray: {
                        input: "$children", 
                        sortBy: { priority: 1 } 
                    } 
                }
            }
        },
    ];

    if (name && language) {
        pipline.push({
            $match: {
                $or: [
                    { [`names.${language}`]: { $regex: name, $options: 'i' } },
                    { [`children.names.${language}`]: { $regex: name, $options: 'i' } }
                ]
            }
        })
    }

    let categoriesQuery = categoryModel.aggregate(pipline);

    if (allPages === false || !allPages) {
        categoriesQuery = categoriesQuery.skip((current - 1) * pageSize).limit(pageSize);
    }

    let categories = await categoriesQuery.exec();

    const result = [];

    for (category of categories) {
        result.push(...category.children)
        result.push({ ...category, children: null})
    }

    function buildHierarchy(categories) {
        const map = new Map();

        categories.forEach(category => {
            map.set(category._id.toString(), { 
                ...category,
                key: category._id 
            });
        });
    
        const result = [];
        map.forEach((category, id) => {
            if (category.parent) {
                const parentCategory = map.get(category.parent.toString());
                if (!parentCategory.children) parentCategory.children = [];
                if (parentCategory) parentCategory.children.push(category);
            } else {
                result.push(category);
            }
        });
        return result;
    }

    categories = buildHierarchy(result);

    const categoriesCount = await categoryModel.count(query);

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














