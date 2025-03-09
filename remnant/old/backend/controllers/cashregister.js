const cashregisterModel = require("../models/cashregister.js");
const { createNotification } = require("./notification.js");

const createCashregister = async ({ names, priority }) => {
  let status = null;
  let data = null;
  let warnings = [];
  let errors = [];
  let info = [];

  const createdCashregister = await cashregisterModel.create({
    names,
    priority,
  });

  if (createdCashregister) {
    status = "success";
    data = createdCashregister;
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

const addCashregisterAccount = async ({ cashregister, account }) => {
  let status = null;
  let data = null;
  let warnings = [];
  let errors = [];
  let info = [];

  const updatedCashregister = await cashregisterModel.updateOne(
    { _id: cashregister },
    { $push: { accounts: account } }
  );

  if (updatedCashregister) {
    status = "success";
    data = updatedCashregister;
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

const editCashregister = async ({ _id, names, priority }) => {
  let status = null;
  let data = null;
  let warnings = [];
  let errors = [];
  let info = [];

  const editedCashregister = await cashregisterModel.updateOne(
    { _id },
    { names, priority }
  );

  if (editedCashregister) {
    status = "success";
    data = editedCashregister;
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

const getCashregisters = async ({ filter, sorter, pagination }) => {
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

  filter = { removed: false };

  let pipeline = [
    {
      $match: filter,
    },
    {
      $lookup: {
        from: "cashregister-accounts",
        localField: "accounts",
        foreignField: "_id",
        as: "accounts",
        pipeline: [
          { $sort: { priority: 1 } },
          // {
          //     $project: {
          //         _id: 1,
          //         symbol: 1
          //     }
          // }
        ],
      },
    },
    {
      $sort: { priority: 1 },
    },
  ];

  let cashregisterQuery = cashregisterModel.aggregate(pipeline);

  if (allPages === false || !allPages) {
    cashregisterQuery = cashregisterQuery
      .skip((current - 1) * pageSize)
      .limit(pageSize);
  }

  let cashregisters = await cashregisterQuery.exec();

  let cashregistersCount = await cashregisterModel.count();

  if (cashregisters) {
    status = "success";
    data = { cashregisters, cashregistersCount };
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

const removeCashregister = async ({ _id }) => {
  let status = null;
  let data = null;
  let warnings = [];
  let errors = [];
  let info = [];

  const removedCashregister = await cashregisterModel.updateOne(
    { _id },
    { removed: true }
  );

  if (removedCashregister) {
    status = "success";
    data = removedCashregister;
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
  createCashregister,
  getCashregisters,
  removeCashregister,
  editCashregister,
  addCashregisterAccount,
};
