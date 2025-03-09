const barcodeModel = require("../models/barcode.js");

const createBarcode = async ({ code, products }) => {
  let status = null;
  let data = null;
  let warnings = [];
  let errors = [];
  let info = [];

  const createdBarcode = await barcodeModel.create({ code, products });

  if (createdBarcode) {
    status = "success";
    data = createdBarcode;
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

const editBarcode = async ({ _id, code, products }) => {
  let status = null;
  let data = null;
  let warnings = [];
  let errors = [];
  let info = [];

  if (!parent) parent = null;

  const editedBarcode = await barcodeModel.findOneAndUpdate(
    { _id },
    { code, products },
    { new: true }
  );

  if (editedBarcode) {
    status = "success";
    data = editedBarcode;
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

const getBarcodes = async ({ filter, sorter, pagination }) => {
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

  const { code, single } = filter || { code: null, single: false };

  let query = {};

  if (code) query.code = code;

  let pipeline = [
    {
      $match: query,
    },
  ];

  let barcodesQuery = barcodeModel.aggregate(pipeline);

  if (allPages === false || !allPages) {
    barcodesQuery = barcodesQuery
      .skip((current - 1) * pageSize)
      .limit(pageSize);
  }

  let barcodes = await barcodesQuery.exec();

  const barcodesCount = await barcodeModel.count(query);

  if (barcodes) {
    status = "success";
    data = single
      ? { barcode: barcodes[0], barcodesCount }
      : { barcodes, barcodesCount };
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

const removeBarcode = async ({ _id }) => {
  let status = null;
  let data = null;
  let warnings = [];
  let errors = [];
  let info = [];

  const removedBarcode = await barcodeModel.deleteOne({ _id });

  if (removedBarcode) {
    status = "success";
    data = removedBarcode;
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
  createBarcode,
  getBarcodes,
  removeBarcode,
  editBarcode,
};
