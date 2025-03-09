const moneyTransactionsModel = require("../models/money-transaction.js");
const { createNotification } = require("./notification.js");
const { countMoneyCashregisterAccount } = require("./cashregister-account.js");

const mongoose = require("mongoose");

const createMoneyTransaction = async ({
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

  const createdMoneyTransaction = await moneyTransactionsModel.create({
    to,
    from,
    exchangeRate,
    paymentDate,
    comment,
  });

  countMoneyCashregisterAccount({
    type: "inc",
    cashregister: to.cashregister,
    cashregisterAccount: to.cashregisterAccount,
    currency: to.currency,
    amount: to.amount,
  });

  if (createdMoneyTransaction) {
    status = "success";
    data = createdMoneyTransaction;
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

const editMoneyTransaction = async ({
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

  const editedMoneyTransaction = await moneyTransactionsModel.updateOne(
    { _id },
    { to, from, exchangeRate, paymentDate, comment }
  );

  if (editedMoneyTransaction) {
    status = "success";
    data = editedMoneyTransaction;
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

const getMoneyTransactions = async ({ filter, sorter, pagination }) => {
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

  const { cashregister } = filter || { cashregister: false };

  query = { removed: false };

  if (cashregister) {
    query["$or"] = [
      {
        "to.cashregister": mongoose.Types.ObjectId(cashregister),
      },
      {
        "from.cashregister": mongoose.Types.ObjectId(cashregister),
      },
    ];
  }

  console.log(query);

  let pipeline = [
    {
      $match: query,
    },
    {
      $lookup: {
        from: "cashregisters",
        localField: "from.cashregister",
        foreignField: "_id",
        as: "from.cashregister",
      },
    },
    {
      $lookup: {
        from: "cashregister-accounts",
        localField: "from.cashregisterAccount",
        foreignField: "_id",
        as: "from.cashregisterAccount",
      },
    },
    {
      $lookup: {
        from: "currencies",
        localField: "from.currency",
        foreignField: "_id",
        as: "from.currency",
      },
    },
    {
      $lookup: {
        from: "cashregisters",
        localField: "to.cashregister",
        foreignField: "_id",
        as: "to.cashregister",
      },
    },
    {
      $lookup: {
        from: "cashregister-accounts",
        localField: "to.cashregisterAccount",
        foreignField: "_id",
        as: "to.cashregisterAccount",
      },
    },
    {
      $lookup: {
        from: "currencies",
        localField: "to.currency",
        foreignField: "_id",
        as: "to.currency",
      },
    },
    {
      $unwind: { path: "$from.cashregister", preserveNullAndEmptyArrays: true },
    },
    {
      $unwind: {
        path: "$from.cashregisterAccount",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: { path: "$from.currency", preserveNullAndEmptyArrays: true },
    },
    {
      $unwind: { path: "$to.cashregister", preserveNullAndEmptyArrays: true },
    },
    {
      $unwind: {
        path: "$to.cashregisterAccount",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: { path: "$to.currency", preserveNullAndEmptyArrays: true },
    },
    {
      $sort: { createdAt: -1 },
    },
  ];

  let moneyTransactionsQuery = moneyTransactionsModel.aggregate(pipeline);

  if (allPages === false || !allPages) {
    moneyTransactionsQuery = moneyTransactionsQuery
      .skip((current - 1) * pageSize)
      .limit(pageSize);
  }

  let moneyTransactions = await moneyTransactionsQuery.exec();

  let moneyTransactionsCount = await moneyTransactionsModel.count();

  if (moneyTransactions) {
    status = "success";
    data = { moneyTransactions, moneyTransactionsCount };
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

const removeMoneyTransaction = async ({ _id }) => {
  let status = null;
  let data = null;
  let warnings = [];
  let errors = [];
  let info = [];

  const removedMoneyTransaction = await moneyTransactionsModel.updateOne(
    { _id },
    { removed: true }
  );

  if (removedMoneyTransaction) {
    status = "success";
    data = removedMoneyTransaction;
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
  createMoneyTransaction,
  getMoneyTransactions,
  removeMoneyTransaction,
  editMoneyTransaction,
};
