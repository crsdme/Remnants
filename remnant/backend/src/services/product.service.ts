import ProductModel, { ProductInterface } from "../models/product";
import mongoose, { Schema } from "mongoose";
const { ObjectId, Mixed } = Schema.Types;

interface ProductsResult {
  products: any[];
  productsCount: number;
}

export const get = async (filters: object): Promise<ProductsResult> => {
  // const { current, pageSize, allPages } = (pagination || { current: 1, pageSize: 10, allPages: false });

  // const { quantity } = (filters || { quantity: null });

  let query = { removed: false };

  // const stockFilter = new ObjectId(quantity?.[0]);

  let pipeline = [
    {
      $match: query,
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
    // CATEGORY
    {
      $lookup: {
        from: "categories",
        localField: "categories._id",
        foreignField: "_id",
        as: "categories",
        pipeline: [
          {
            $project: {
              _id: 1,
              names: 1,
            },
          },
        ],
      },
    },
    // CUSTOM FIELDS
    {
      $set: {
        customFields: {
          $arrayToObject: {
            $map: {
              input: "$customFields",
              as: "field",
              in: {
                k: { $toString: "$$field._id" },
                v: "$$field.data",
              },
            },
          },
        },
      },
    },
    // QUANTITY
    // ...(stockFilter
    //   ? [
    //       {
    //         $lookup: {
    //           from: "quantities",
    //           localField: "quantity",
    //           foreignField: "_id",
    //           as: "quantity",
    //         },
    //       },
    //       {
    //         $addFields: {
    //           quantity: {
    //             $arrayElemAt: [
    //               {
    //                 $filter: {
    //                   input: "$quantity",
    //                   as: "qty",
    //                   cond: { $eq: ["$$qty.stock", stockFilter] },
    //                 },
    //               },
    //               0,
    //             ],
    //           },
    //         },
    //       },
    //     ]
    //   : []),
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
      $addFields: {
        unit: { $arrayElemAt: ["$unit", 0] },
      },
    },
  ];

  let productsCount = await ProductModel.countDocuments(query);

  let productsQuery = ProductModel.aggregate(pipeline);

  // if (allPages === false || !allPages) {
  //   productsQuery = productsQuery.skip((current - 1) * pageSize).limit(pageSize);
  // }

  const products = await productsQuery.exec();

  if (!products) {
    throw new Error("Products not found");
  }

  return { products, productsCount };
};
