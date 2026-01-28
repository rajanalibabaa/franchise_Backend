import { BrandDetails } from "../model/Brand/Brand.model/BrandDetails.model.js";

export const getBrandsHelperfuntion = async (
  match = {},
  project = {},
  limit,
  skip,
  brandfranchisedetails = false,
  branduploads = false,
  brandexpansionlocationdatas = false,
) => {
  try {
    const pipeline = [];

    pipeline.push({
      $match: {
        "brandDetails.isBrandPause": { $ne: true },
        "brandDetails.isApproved": { $ne: false },
      },
    });

    if (brandfranchisedetails) {
      pipeline.push(
        {
          $lookup: {
            from: "brandfranchisedetails",
            localField: "uuid",
            foreignField: "brandOwnerId",
            as: "franchiseDetails",
          },
        },
        {
          $unwind: {
            path: "$franchiseDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
      );
    }

    if (branduploads) {
      pipeline.push(
        {
          $lookup: {
            from: "branduploads",
            localField: "uuid",
            foreignField: "brandOwnerId",
            as: "uploads",
          },
        },
        {
          $unwind: {
            path: "$uploads",
            preserveNullAndEmptyArrays: true,
          },
        },
      );
    }

    if (brandexpansionlocationdatas) {
      pipeline.push(
        {
          $lookup: {
            from: "brandexpansionlocationdatas",
            localField: "uuid",
            foreignField: "brandOwnerId",
            as: "brandexpansionlocationdata",
          },
        },
        {
          $unwind: {
            path: "$brandexpansionlocationdata",
            preserveNullAndEmptyArrays: true,
          },
        },
      );
    }

    // Only push match if it's an object with keys
    if (match && Object.keys(match).length > 0) {
      pipeline.push({ $match: match });
    }

    if (Object.keys(project).length) {
      pipeline.push({ $project: project });
    }

    if (typeof skip === "number" && skip > 0) {
      pipeline.push({ $skip: skip });
    }

    if (typeof limit === "number" && limit > 0) {
      pipeline.push({ $limit: limit });
    }

    // console.log("pipeline :", pipeline);

    return await BrandDetails.aggregate(pipeline);
  } catch (error) {
    console.error("Error fetching brands:", error);
    throw error;
  }
};
