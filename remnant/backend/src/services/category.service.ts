import CategoryModel, { CategoryInterface } from "../models/category";
import mongoose, { ObjectId, Schema } from "mongoose";

interface getCategoriesResult {
  categories: any[];
  categoriesCount: number;
}

interface getCategoriesParams {
  filters?: {
    names: string;
    language: string;
    flat: boolean;
  };
  sorters: any[];
  pagination?: {
    current: number;
    pageSize: number;
  };
}

export const get = async (
  payload: getCategoriesParams
): Promise<getCategoriesResult> => {
  const { current = 1, pageSize = 10 } = payload?.pagination || {
    current: 1,
    pageSize: 10,
  };

  const {
    names = null,
    language = "en",
    flat = false,
  } = payload?.filters || {
    names: null,
    language: null,
    flat: null,
  };

  let query: any = { removed: false };

  if (!flat) query.parent = { $eq: null };

  let pipeline = [
    {
      $match: query,
    },
    // CATEGORY
    {
      $graphLookup: {
        from: "categories",
        startWith: "$_id",
        connectFromField: "_id",
        connectToField: "parent",
        as: "children",
        depthField: "level",
      },
    },
    {
      $addFields: {
        children: {
          $sortArray: {
            input: "$children",
            sortBy: { priority: 1 },
          },
        },
      },
    },
    // CATEGORY LOOKUP
    {
      $lookup: {
        from: "categories",
        let: { childParents: "$children.parent" },
        pipeline: [
          {
            $match: {
              $expr: { $in: ["$_id", "$$childParents"] },
            },
          },
          {
            $project: { names: 1, _id: 1 },
          },
        ],
        as: "parentData",
      },
    },
    {
      $addFields: {
        children: {
          $map: {
            input: "$children",
            as: "child",
            in: {
              $mergeObjects: [
                "$$child",
                {
                  parent: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$parentData",
                          as: "p",
                          cond: { $eq: ["$$p._id", "$$child.parent"] },
                        },
                      },
                      0,
                    ],
                  },
                },
              ],
            },
          },
        },
      },
    },
    { $project: { parentData: 0 } },
    { $sort: { priority: -1 as const } },
  ];

  if (names && language) {
    pipeline = [
      {
        $match: {
          ...query,
          $or: [
            { [`names.${language}`]: { $regex: names, $options: "i" } },
            {
              [`children.names.${language}`]: {
                $regex: names,
                $options: "i",
              },
            },
          ],
        } as any,
      },
    ];
  }

  let categoriesCount = await CategoryModel.countDocuments(query);

  let categoriesQuery = CategoryModel.aggregate(pipeline);

  categoriesQuery = categoriesQuery
    .skip((current - 1) * pageSize)
    .limit(pageSize);

  let categories = await categoriesQuery.exec();

  // PUSH CHILDREN

  const result = [];

  for (const category of categories) {
    result.push(...(category?.children || []));
    result.push({ ...category, children: null });
  }

  function buildHierarchy(categories: CategoryInterface[]) {
    const map = new Map();

    categories.forEach((category) => {
      map.set(category._id.toString(), {
        ...category,
        key: category._id,
      });
    });

    const resultTemp: any[] = [];
    map.forEach((category, id) => {
      if (category.parent) {
        const parentCategory = map.get(category.parent._id.toString());
        if (!parentCategory.children) parentCategory.children = [];
        if (parentCategory) parentCategory.children.push(category);
      } else {
        resultTemp.push(category);
      }
    });
    return resultTemp;
  }

  if (!flat) categories = buildHierarchy(result);

  // PUSH CHILDREN

  if (!categories) {
    throw new Error("Categories not found");
  }

  return { categories, categoriesCount };
};

interface createCategoryResult {
  category: any;
}

interface createCategoryParams {
  names: object;
  parent: ObjectId;
  priority: number;
}

export const create = async (
  payload: createCategoryParams
): Promise<createCategoryResult> => {
  let category = await CategoryModel.create(payload);

  if (!category) {
    throw new Error("category not created");
  }

  return { category };
};

interface editCategoryResult {
  category: any;
}

interface editCategoryParams {
  _id: string;
  names: object;
  parent: ObjectId | null;
  priority: number;
}

export const edit = async (
  payload: editCategoryParams
): Promise<editCategoryResult> => {
  const { _id, parent } = payload;

  if (!parent) payload.parent = null;

  if (!_id) {
    throw new Error("Need _ID");
  }
  let category = await CategoryModel.updateOne({ _id }, payload);

  if (!category) {
    throw new Error("category not edited");
  }

  return { category };
};

interface removeCategoryResult {
  category: any;
}

interface removeCategoryParams {
  _id: string;
}

export const remove = async (
  payload: removeCategoryParams
): Promise<removeCategoryResult> => {
  const { _id } = payload;

  if (!_id) {
    throw new Error("Need _ID");
  }

  let category = await CategoryModel.updateOne(
    { _id },
    { $set: { removed: true } }
  );

  if (!category) {
    throw new Error("unit not removed");
  }

  return { category };
};
