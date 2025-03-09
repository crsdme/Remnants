const productTransactionsModel = require("../models/product-transaction.js");
const { createNotification } = require("./notification.js");
const { countQuantity } = require("./quantity.js");

const mongoose = require("mongoose");

const createProductTransaction = async ({
  to,
  from,
  products,
  type,
  purchaseId,
  orderId,
  comment,
  userId,
}) => {
  let status = null;
  let data = null;
  let warnings = [];
  let errors = [];
  let info = [];

  const createdProductTransaction = await productTransactionsModel.create({
    to,
    from,
    products,
    type,
    purchaseId,
    orderId,
    comment,
  });

  for (product of products) {
    countQuantity({
      product: product._id,
      amount: product.quantity,
      stock: product.stock,
    });
  }

  if (createdProductTransaction) {
    status = "success";
    data = createdProductTransaction;
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

const editProductTransaction = async ({
  to,
  from,
  exchangeRate,
  paymentDate,
  comment,
  userId,
}) => {
  let status = null;
  let data = null;
  let warnings = [];
  let errors = [];
  let info = [];

  const editedProductTransaction = await productTransactionsModel.updateOne(
    { _id },
    { to, from, exchangeRate, paymentDate, comment }
  );

  if (editedProductTransaction) {
    status = "success";
    data = editedProductTransaction;
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

const getProductTransactions = async ({ filter, sorter, pagination }) => {
  let status = null;
  let data = null;
  let warnings = [];
  let errors = [];
  let info = [];

  const { current, pageSize, allPages } = pagination || {
    current: 1,
    pageSize: 10,
    allPages: false,
  };

  const { stock } = filter || { stock: false };

  query = { removed: false };

  if (stock) {
    query["$or"] = [
      {
        "to.stock": mongoose.Types.ObjectId(stock),
      },
      {
        "from.stock": mongoose.Types.ObjectId(stock),
      },
    ];
  }

  let pipeline = [
    {
      $match: query,
    },
    {
      $lookup: {
        from: "stocks",
        localField: "to.stock",
        foreignField: "_id",
        as: "to.stock",
      },
    },
    {
      $lookup: {
        from: "stocks",
        localField: "from.stock",
        foreignField: "_id",
        as: "from.stock",
      },
    },
    {
      $lookup: {
        from: "purchases",
        localField: "purchaseId",
        foreignField: "_id",
        pipeline: [
          {
            $project: { id: 1 },
          },
        ],
        as: "purchase",
      },
    },
    {
      $lookup: {
        from: "orders",
        localField: "orderId",
        foreignField: "_id",
        pipeline: [
          {
            $project: { id: 1 },
          },
        ],
        as: "order",
      },
    },
    {
      $unwind: { path: "$purchase", preserveNullAndEmptyArrays: true },
    },
    {
      $unwind: { path: "$to.stock", preserveNullAndEmptyArrays: true },
    },
    {
      $unwind: { path: "$from.stock", preserveNullAndEmptyArrays: true },
    },

    {
      $lookup: {
        from: "products",
        localField: "products._id",
        foreignField: "_id",
        as: "populatedProducts",
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
    { $unset: "populatedProducts" },

    {
      $sort: { createdAt: -1 },
    },
  ];

  let productTransactionsQuery = productTransactionsModel.aggregate(pipeline);

  if (allPages === false || !allPages) {
    productTransactionsQuery = productTransactionsQuery
      .skip((current - 1) * pageSize)
      .limit(pageSize);
  }

  let productTransactions = await productTransactionsQuery.exec();

  let productTransactionsCount = await productTransactionsModel.count();

  if (productTransactions) {
    status = "success";
    data = { productTransactions, productTransactionsCount };
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

const removeProductTransaction = async ({ _id }) => {
  let status = null;
  let data = null;
  let warnings = [];
  let errors = [];
  let info = [];

  const removedProductTransaction = await productTransactionsModel.updateOne(
    { _id },
    { removed: true }
  );

  if (removedProductTransaction) {
    status = "success";
    data = removedProductTransaction;
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
  createProductTransaction,
  getProductTransactions,
  // removeProductTransaction,
  // editProductTransaction,
};
