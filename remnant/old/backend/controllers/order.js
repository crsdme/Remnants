const orderModel = require("../models/order.js");
const { createProductTransaction } = require("./product-transactions.js");

const calculateStockChanges = ({
  newProducts,
  oldProducts,
  newStock,
  oldStock,
}) => {
  const changes = [];

  // Создаем Map для старого заказа (ключ = _id + склад)
  const oldMap = new Map(
    oldProducts.map((p) => [`${p._id}-${oldStock}`, p.quantity])
  );

  newStock = newStock.toString();
  oldStock = oldStock.toString();

  // Обрабатываем новый заказ
  for (const newItem of newProducts) {
    const id = newItem._id.toString();
    const newQty = newItem.quantity;
    const oldQty = oldMap.get(`${id}-${oldStock}`) ?? 0; // Берем старое количество или 0
    const keyNew = `${id}-${newStock}`;
    const keyOld = `${id}-${oldStock}`;

    if (newStock !== oldStock) {
      // Если склад изменился, сначала возвращаем на старый, потом списываем с нового
      if (oldQty > 0) {
        changes.push({ _id: id, stock: oldStock, quantity: oldQty }); // Возвращаем старое количество
      }
      if (newQty > 0) {
        changes.push({ _id: id, stock: newStock, quantity: -newQty }); // Списываем новое количество
      }
    } else {
      // Если склад тот же, просто изменяем количество
      if (newQty !== oldQty) {
        changes.push({ _id: id, stock: newStock, quantity: newQty - oldQty });
      }
    }

    oldMap.delete(keyOld);
  }

  // Оставшиеся товары в старом заказе нужно полностью вернуть
  for (const [key, qty] of oldMap.entries()) {
    const [id, stock] = key.split("-");
    changes.push({ _id: id, stock, quantity: qty }); // Вернуть оставшиеся товары на старый склад
  }

  return changes;
};

const calculateTotalPrice = ({ products }) => {
  const totals = {};

  for (const item of products) {
    const price = item.price;
    const quantity = item.quantity;
    const currencyId = item.currency._id;
    const totalItemPrice = price * quantity;

    if (!totals[currencyId]) totals[currencyId] = 0;
    totals[currencyId] += totalItemPrice;
  }

  return Object.entries(totals).map(([currency, amount]) => ({
    currency,
    amount,
  }));
};

const createOrder = async ({
  stock,
  source,
  products,
  comment,
  orderStatus,
  deliveryService,
  paymentStatus,
  client,
  userId,
}) => {
  let status = null;
  let data = null;
  let warnings = [];
  let errors = [];
  let info = [];

  const id = await orderModel.count();

  const totals = calculateTotalPrice({ products });

  const createdOrder = await orderModel.create({
    id: id + 1,
    stock,
    source,
    products,
    comment,
    orderStatus,
    deliveryService,
    client,
    totals,
  });

  products = products.map((product) => ({
    _id: product._id,
    quantity: product.quantity * -1,
    stock,
  }));

  createProductTransaction({
    from: { stock },
    to: { stock },
    type: "order",
    orderId: createdOrder._id,
    products,
  });

  if (createdOrder) {
    status = "success";
    data = createdOrder;
  } else {
    status = "failed";
  }

  return {
    status,
    data,
    errors,
    warnings,
    info,
  };
};

const editOrder = async ({
  id,
  stock,
  source,
  products,
  comment,
  orderStatus,
  deliveryType,
  paymentStatus,
  client,
  userId,
}) => {
  let status = null;
  let data = null;
  let warnings = [];
  let errors = [];
  let info = [];

  const totals = calculateTotalPrice({ products });

  const editedOrder = await orderModel.findOneAndUpdate(
    { id },
    {
      stock,
      source,
      products,
      comment,
      orderStatus,
      deliveryType,
      client,
      totals,
    }
  );

  const productsMap = calculateStockChanges({
    oldProducts: editedOrder.products,
    newProducts: products,
    oldStock: editedOrder.stock,
    newStock: stock,
  });

  createProductTransaction({
    from: { stock: editedOrder.stock },
    to: { stock },
    type: "order",
    orderId: editedOrder._id,
    products: productsMap,
  });

  if (editedOrder) {
    status = "success";
    data = editedOrder;
  } else {
    status = "failed";
  }

  return {
    status,
    data,
    errors,
    warnings,
    info,
  };
};

const getOrders = async ({ filter, sorter, pagination }) => {
  let status = null;
  let data = null;
  let warnings = [];
  let errors = [];
  let info = [];

  const { current, pageSize, allPages } = pagination || {
    current: 1,
    pageSize: 10,
    allPages: null,
  };

  const { id } = filter || { id: null };

  filter = { removed: false };

  if (id) {
    filter.id = parseInt(id);
  }

  let pipeline = [
    {
      $match: filter,
    },
    // CLIENTS
    {
      $lookup: {
        from: "clients",
        localField: "client",
        foreignField: "_id",
        as: "client",
      },
    },
    {
      $unwind: {
        path: "$client",
        preserveNullAndEmptyArrays: true,
      },
    },
    // TOTALS
    {
      $lookup: {
        from: "currencies",
        localField: "totals.currency",
        foreignField: "_id",
        as: "currencyData",
      },
    },
    {
      $addFields: {
        totals: {
          $map: {
            input: "$totals",
            as: "total",
            in: {
              currency: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$currencyData",
                      as: "cur",
                      cond: { $eq: ["$$cur._id", "$$total.currency"] },
                    },
                  },
                  0,
                ],
              },
              amount: "$$total.amount",
            },
          },
        },
      },
    },
    // ORDER PAYMENTS
    {
      $lookup: {
        from: "order-payments",
        localField: "orderPayments",
        foreignField: "_id",
        as: "orderPayments",
        pipeline: [
          {
            $match: { removed: { $ne: true } },
          },
          {
            $lookup: {
              from: "cashregisters",
              localField: "cashregister",
              foreignField: "_id",
              as: "cashregister",
            },
          },
          {
            $unwind: {
              path: "$cashregister",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: "cashregister-accounts",
              localField: "cashregisterAccount",
              foreignField: "_id",
              as: "cashregisterAccount",
            },
          },
          {
            $unwind: {
              path: "$cashregisterAccount",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: "currencies",
              localField: "currency",
              foreignField: "_id",
              as: "currency",
            },
          },
          {
            $unwind: {
              path: "$currency",
              preserveNullAndEmptyArrays: true,
            },
          },
        ],
      },
    },
    // PRODUCTS
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
            },
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
                    symbol: 1,
                  },
                },
              ],
            },
          },
          {
            $unwind: {
              path: "$currency",
              preserveNullAndEmptyArrays: true,
            },
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
                    symbol: 1,
                  },
                },
              ],
            },
          },
          {
            $unwind: {
              path: "$wholesaleCurrency",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $addFields: {
              wholesaleCurrency: {
                $ifNull: ["$wholesaleCurrency", "$currency"],
              },
            },
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
              preserveNullAndEmptyArrays: true,
            },
          },
        ],
      },
    },
    {
      $set: {
        products: {
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
                        cond: { $eq: ["$$pop._id", "$$p._id"] },
                      },
                    },
                    0,
                  ],
                },
                "$$p",
              ],
            },
          },
        },
      },
    },
    { $unset: ["populatedProducts", "currencyData"] },
  ];

  let ordersQuery = orderModel.aggregate(pipeline);

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
    status = "success";
    data = { orders, ordersCount };
  } else {
    status = "failed";
  }

  return {
    status,
    data,
    errors,
    warnings,
    info,
  };
};

const removeOrder = async ({ _id }) => {
  let status = null;
  let data = null;
  let warnings = [];
  let errors = [];
  let info = [];

  const removedOrder = await orderModel.updateOne({ _id }, { removed: true });

  if (removedOrder) {
    status = "success";
    data = removedOrder;
  } else {
    status = "failed";
  }

  return {
    status,
    data,
    errors,
    warnings,
    info,
  };
};

const addOrderPayment = async ({ order, orderPayment, userId }) => {
  let status = null;
  let data = null;
  let warnings = [];
  let errors = [];
  let info = [];

  const editedOrder = await orderModel.updateOne(
    { _id: order },
    { $push: { orderPayments: orderPayment } }
  );

  if (editedOrder) {
    status = "success";
    data = editedOrder;
  } else {
    status = "failed";
  }

  return {
    status,
    data,
    errors,
    warnings,
    info,
  };
};

module.exports = {
  createOrder,
  getOrders,
  removeOrder,
  editOrder,
  addOrderPayment,
};
