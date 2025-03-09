const customFieldOptionModel = require("../models/custom-field-option.js");
const customFieldModel = require("../models/custom-field.js");

const createCustomFieldOption = async ({ _id, options }) => {
  let status = null;
  let data = null;
  let warnings = [];
  let errors = [];
  let info = [];

  for (option of options) {
    createdOption = await customFieldOptionModel.create({
      names: option.names,
    });
    await customFieldModel.updateOne(
      { _id },
      { $push: { options: createdOption._id } }
    );
  }

  if (true) {
    status = "success";
    // data = createdCustomFieldOption;
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

const editCustomFieldOption = async ({ _id, names }) => {
  let status = null;
  let data = null;
  let warnings = [];
  let errors = [];
  let info = [];

  const editedCustomFieldOption = await customFieldOptionModel.findOneAndUpdate(
    { _id },
    { names },
    { new: true }
  );

  if (editedCustomFieldOption) {
    status = "success";
    data = editedCustomFieldOption;
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

const getCustomFieldOptions = async ({ filter, sorter, pagination }) => {
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

  const { name, language } = filter || { name: null, language: null };

  let query = { parent: { $eq: null } };

  let pipeline = [
    {
      $match: query,
    },
    {
      $sort: { priority: 1 },
    },
  ];

  if (name && language) {
    pipeline.push({
      $match: {
        [`names.${language}`]: { $regex: name, $options: "i" },
      },
    });
  }

  let customFieldsQuery = customFieldOptionModel.aggregate(pipeline);

  if (allPages === false || !allPages) {
    customFieldsQuery = customFieldsQuery
      .skip((current - 1) * pageSize)
      .limit(pageSize);
  }

  let customFields = await customFieldsQuery.exec();

  const customFieldsCount = await customFieldOptionModel.count(query);

  if (customFields) {
    status = "success";
    data = { customFields, customFieldsCount };
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

const removeCustomFieldOption = async ({ _id }) => {
  let status = null;
  let data = null;
  let warnings = [];
  let errors = [];
  let info = [];

  const removedCustomFieldOption = await customFieldOptionModel.deleteOne({
    _id,
  });

  if (removedCustomFieldOption) {
    status = "success";
    data = removedCustomFieldOption;
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
  createCustomFieldOption,
  getCustomFieldOptions,
  removeCustomFieldOption,
  editCustomFieldOption,
};
