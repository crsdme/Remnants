const orderPaymentModel = require("../models/order-payment.js");
const { createNotification } = require("./notification.js");
const { addOrderPayment } = require("./order.js");
const { createMoneyTransaction } = require("./money-transactions.js");

const createOrderPayment = async ({
  order,
  cashregister,
  cashregisterAccount,
  paymentStatus,
  amount,
  currency,
  paymentDate,
  comment,
}) => {
  let status = null;
  let data = null;
  let warnings = [];
  let errors = [];
  let info = [];

  const createdOrderPayment = await orderPaymentModel.create({
    order,
    cashregister,
    cashregisterAccount,
    paymentStatus,
    amount,
    currency,
    paymentDate,
    comment,
  });

  addOrderPayment({ order, orderPayment: createdOrderPayment._id });

  if (paymentStatus === "paid") {
    createMoneyTransaction({
      from: {
        cashregister: cashregister,
        cashregisterAccount: cashregisterAccount,
        amount: amount,
        currency: currency,
      },
      to: {
        cashregister: cashregister,
        cashregisterAccount: cashregisterAccount,
        amount: amount,
        currency: currency,
      },
      status: "completed",
      paymentDate: paymentDate,
      acceptedBy: null,
      createdBy: null,
      canceledBy: null,
    });
  }

  if (createdOrderPayment) {
    status = "success";
    data = createdOrderPayment;
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

const editOrderPayment = async ({
  _id,
  cashregister,
  cashregisterAccount,
  paymentStatus,
  amount,
  currency,
  date,
  comment,
}) => {
  let status = null;
  let data = null;
  let warnings = [];
  let errors = [];
  let info = [];

  const editedOrderPayment = await orderPaymentModel.updateOne(
    { _id },
    {
      cashregister,
      cashregisterAccount,
      paymentStatus,
      amount,
      currency,
      date,
      comment,
    }
  );

  if (editedOrderPayment) {
    status = "success";
    data = editedOrderPayment;
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

const getOrderPayments = async ({ filter, sorter, pagination }) => {
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

  const { order } = filter || { order: null };

  filter = { removed: false };

  if (order) {
    filter.order = order;
  }

  let pipeline = [
    {
      $match: filter,
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
    {
      $sort: { priority: 1 },
    },
  ];

  let orderPaymentQuery = orderPaymentModel.aggregate(pipeline);

  if (allPages === false || !allPages) {
    orderPaymentQuery = orderPaymentQuery
      .skip((current - 1) * pageSize)
      .limit(pageSize);
  }

  let orderPayments = await orderPaymentQuery.exec();

  let orderPaymentsCount = await orderPaymentModel.count();

  if (orderPayments) {
    status = "success";
    data = { orderPayments, orderPaymentsCount };
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

const removeOrderPayment = async ({ order, orderPayment }) => {
  let status = null;
  let data = null;
  let warnings = [];
  let errors = [];
  let info = [];

  const removedOrderPayment = await orderPaymentModel.findOneAndUpdate(
    { _id: orderPayment },
    { removed: true }
  );

  createMoneyTransaction({
    from: {
      cashregister: removedOrderPayment.cashregister,
      cashregisterAccount: removedOrderPayment.cashregisterAccount,
      amount: removedOrderPayment.amount,
      currency: removedOrderPayment.currency,
    },
    to: {
      cashregister: removedOrderPayment.cashregister,
      cashregisterAccount: removedOrderPayment.cashregisterAccount,
      amount: removedOrderPayment.amount * -1,
      currency: removedOrderPayment.currency,
    },
    status: "cancelled",
    paymentDate: removedOrderPayment.paymentDate,
    acceptedBy: null,
    createdBy: null,
    canceledBy: null,
  });

  if (removedOrderPayment) {
    status = "success";
    data = removedOrderPayment;
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
  createOrderPayment,
  getOrderPayments,
  removeOrderPayment,
  editOrderPayment,
};
