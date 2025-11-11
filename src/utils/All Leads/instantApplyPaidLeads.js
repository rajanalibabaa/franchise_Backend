import { BrandDetails } from "../../model/Brand/Brand.model/BrandDetails.model.js";
import { InstantApplyPaidUserLeadsData } from "../../model/NewIncomeInvestor/instantApplyPaidleadsModel.js";
import { sendInstantApplyLeadLocation } from "../Centralized Email/centralizedEmail.js";
import BrandEmailCount from "../../model/NewIncomeInvestor/BrandEmailCountSchema.js";
import { CategoryInvestmentrangeLocationMatch } from "../../model/Leads/categoryInvestmentrangeLocationMatch.model.js";

export const paidLeadHelperFunction = async (
  investmentRange,
  category,
  location
) => {
  console.log("paidLeadHelperFunction:", investmentRange, category, location);

  const aggregationPipeline = [
    {
      $match: {
        "brandDetails.isBrandPause": { $ne: true },
        "brandDetails.payment": true,
      },
    },
    {
      $lookup: {
        from: "brandfranchisedetails",
        localField: "uuid",
        foreignField: "brandOwnerId",
        as: "franchiseDetails",
      },
    },
    {
      $lookup: {
        from: "branduploads",
        localField: "uuid",
        foreignField: "brandOwnerId",
        as: "uploads",
      },
    },
    {
      $lookup: {
        from: "brandexpansionlocationdatas",
        localField: "uuid",
        foreignField: "brandOwnerId",
        as: "expansionLocationDatas",
      },
    },
    {
      $unwind: {
        path: "$franchiseDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: "$uploads",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: "$expansionLocationDatas",
        preserveNullAndEmptyArrays: true,
      },
    },
  ];

    if (investmentRange) {
      aggregationPipeline.push({
        $match: {
          "franchiseDetails.franchiseDetails.fico.0.investmentRange":
            investmentRange,
        },
      });
    }
    if (category) {
      aggregationPipeline.push({
        $match: {
          "franchiseDetails.franchiseDetails.brandCategories.main":
            category.mainCategory,
          "franchiseDetails.franchiseDetails.brandCategories.sub":
            category.subCategory,
        },
      });
    }
  //   if (location) {
  //     const andConditions = [];

  //     if (location?.state) {
  //       andConditions.push({
  //         "expansionLocationDatas.expansionLocationData.expansionLocations.domestic.locations.state":
  //           location.state,
  //       });
  //     }

  //     if (location?.district) {
  //       andConditions.push({
  //         "expansionLocationDatas.expansionLocationData.expansionLocations.domestic.locations.districts.district":
  //           location.district,
  //       });
  //     }

  //     if (andConditions.length > 0) {
  //       aggregationPipeline.push({
  //         $match: { $and: andConditions },
  //       });
  //     }
  //   }

  if (location?.state && location?.district) {
    aggregationPipeline.push({
      $match: {
        "expansionLocationDatas.expansionLocationData.expansionLocations.domestic.locations":
          {
            $elemMatch: {
              state: location.state,
              districts: {
                $elemMatch: {
                  district: location.district,
                },
              },
            },
          },
      },
    });
  } else if (location?.state) {
    aggregationPipeline.push({
      $match: {
        "expansionLocationDatas.expansionLocationData.expansionLocations.domestic.locations.state":
          location.state,
      },
    });
  }

  aggregationPipeline.push({
    $project: {
      _id: 1,
      uuid: 1,
      brandID: 1,
      brandDetails: 1,
      franchiseDetails: 1,
      uploads: 1,
      expansionLocationDatas: 1,
      createdAt: 1,
      updatedAt: 1,
    },
  });

  const OverAllBrandExists = await BrandDetails.aggregate(aggregationPipeline);
  //   console.log("Paid Leads: Total eligible brands =", OverAllBrandExists);

  for (const brand of OverAllBrandExists) {
    let brandDoc;

    if (category && investmentRange && location) {
      console.log("category && investmentRange && location");
      await CategoryInvestmentrangeLocationMatch.findOne({
        brandId: brand.uuid,
      });

      if (!brandDoc) {
        brandDoc = await CategoryInvestmentrangeLocationMatch.create({
          brandId: brand.uuid,
          brandName: brand.brandDetails?.brandName || "",
        });
      }
      console.log("brandDoc :", brandDoc);
    }
    if (category && location) {
      console.log("category &&  && location");
    }
    if (category && investmentRange) {
      console.log("category && investmentRange && ");
    }
    if (investmentRange && location) {
      console.log(" && investmentRange && location");
    }
  }

  return OverAllBrandExists;
};
