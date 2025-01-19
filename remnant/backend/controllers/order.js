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
    console.log(createdStatus)
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

    const { current, pageSize, allPages } = (pagination || { current: 1, pageSize: 10, allPages: null });

    const { id } = (filter || { id: null });

    filter = { removed: false };

    if (id) {
        filter.id = parseInt(id);
    }

    let pipline = [
        {
            $match: filter
        },
        {
            $lookup: {
                from: "order-payments",
                localField: "orderPayments",
                foreignField: "_id",
                as: "orderPayments",
                pipeline: [
                    { 
                        $match: { removed: { $ne: true } }
                    },
                    {
                        $lookup: {
                            from: "cashregisters",
                            localField: "cashregister",
                            foreignField: "_id",
                            as: "cashregister",
                        }
                    },
                    {
                        $unwind: {
                            path: "$cashregister",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $lookup: {
                            from: "cashregister-accounts",
                            localField: "cashregisterAccount",
                            foreignField: "_id",
                            as: "cashregisterAccount",
                        }
                    },
                    {
                        $unwind: {
                            path: "$cashregisterAccount",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $lookup: {
                            from: "currencies",
                            localField: "currency",
                            foreignField: "_id",
                            as: "currency",
                        }
                    },
                    {
                        $unwind: {
                            path: "$currency",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                ]
            }
        },
        {
            $lookup: {
                from: "products",
                localField: "products._id",
                foreignField: "_id",
                as: "populatedProducts",
                pipeline: [
                    {
                        $lookup: {
                            from: "categories",
                            localField: "categories._id",
                            foreignField: "_id",
                            as: "categories",
                        }
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
                    // UNITS
                    {
                        $lookup: {
                            from: "units",
                            localField: "unit",
                            foreignField: "_id",
                            as: "unit",
                        },
                    },
                    {
                        $unwind: {
                            path: "$unit",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    
                ]
            }
        },
        {
            $set: {
                "products": {
                    $map: {
                        input: "$products",
                        as: "p",
                        in: {
                            $mergeObjects: [
                                { 
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: "$populatedProducts",
                                                as: "pop",
                                                cond: { $eq: ["$$pop._id", "$$p._id"] }
                                            }
                                        },
                                        0
                                    ]
                                },
                                "$$p"
                            ]
                        }
                    }
                }
            }
        },
        { $unset: "populatedProducts" }
    ];

    let ordersQuery = orderModel.aggregate(pipline);

    if (allPages === false || !allPages) {
        ordersQuery = ordersQuery.skip((current - 1) * pageSize).limit(pageSize);
    }

    let orders = await ordersQuery.exec();

    let ordersCount = await orderModel.count();
    
    // let query = orderModel.find(filter);

    // if (allPages === false || !allPages) {
    //     query = query.skip((current - 1) * pageSize).limit(pageSize);
    // }

    // const orders = await query.exec();

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

const addOrderPayment = async ({ order, orderPayment, userId }) => {
    let status = null;
    let data = null;
    let warnings = [];
    let errors = [];
    let info = [];

    const editedOrder = await orderModel.updateOne({ _id: order }, { $push: { orderPayments: orderPayment } });

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

module.exports = {
    createOrder,
    getOrders,
    removeOrder,
    editOrder,
    addOrderPayment,
  };
