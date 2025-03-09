const customFieldGroupModel = require("../models/custom-field-group.js");

const createCustomFieldGroup = async ({
  _id,
  names,
  priority,
  customFields,
}) => {
  let status = null;
  let data = null;
  let warnings = [];
  let errors = [];
  let info = [];

  const createdCustomFieldGroup = await customFieldGroupModel.create({
    _id,
    names,
    priority,
    customFields,
  });

  if (true) {
    status = "success";
    data = createdCustomFieldGroup;
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

const editCustomFieldGroup = async ({ _id, names, priority, customFields }) => {
  let status = null;
  let data = null;
  let warnings = [];
  let errors = [];
  let info = [];

  const editedCustomFieldGroup = await customFieldGroupModel.findOneAndUpdate(
    { _id },
    { names, priority, customFields },
    { new: true }
  );

  if (editedCustomFieldGroup) {
    status = "success";
    data = editedCustomFieldGroup;
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

const getCustomFieldGroups = async ({ filter, sorter, pagination }) => {
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

  let query = {};

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

  let customFieldsGroupQuery = customFieldGroupModel.aggregate(pipeline);

  if (allPages === false || !allPages) {
    customFieldsGroupQuery = customFieldsGroupQuery
      .skip((current - 1) * pageSize)
      .limit(pageSize);
  }

  let customFieldsGroups = await customFieldsGroupQuery.exec();

  const customFieldsGroupsCount = await customFieldGroupModel.count(query);

  if (customFieldsGroups) {
    status = "success";
    data = { customFieldsGroups, customFieldsGroupsCount };
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

const removeCustomFieldGroup = async ({ _id }) => {
  let status = null;
  let data = null;
  let warnings = [];
  let errors = [];
  let info = [];

  const removedCustomFieldOption = await customFieldGroupModel.deleteOne({
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
  createCustomFieldGroup,
  getCustomFieldGroups,
  removeCustomFieldGroup,
  editCustomFieldGroup,
};
