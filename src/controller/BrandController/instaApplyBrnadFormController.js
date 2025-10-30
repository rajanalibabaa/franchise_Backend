import { instantApply } from "../../model/Brand/brandFranchiseApply.js";
import uuid from "../../utils/uuid.js";
import { sendInstantApplyEmail } from "../../utils/Centralized Email/centralizedEmail.js";
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";
import BrandListing from "../../model/Brand/brandListingPage.js";
import { InvsRegister } from "../../model/Investor/invsRegister.js";
import { instantApplyPerfectAndPartial } from "../../utils/All Leads/instantApplyPerfectAndPartial.js";
import InstantApplyLead from "../../model/NewIncomeInvestor/instantApplyPerfectAndPartial.js";
import mongoose, { Aggregate } from "mongoose";
import { instantApplyLocationMatch } from "../../utils/All Leads/instantApplyLocationMatch.js";
import { BrandDetails } from "../../model/Brand/Brand.model/BrandDetails.model.js";
import InstantApplyInvestor from "../../model/NewIncomeInvestor/InstantApplyLocationSchema.js";
import { leadsCreateFunction } from "../Leads/leadsCreateFunction.js";


export const industryMapping = {
  "Food & Beverages": "FoodAndBeverageLeads",
  "Education & Training": "EducationAndTrainingLeads",
  "Health, Beauty & Wellness": "HealthBeautyAndWellnessLeads",
  "Retails & Fashion": "RetailAndFashionLeads",
  "Automotive": "AutomotiveLeads",
  "Home Services & Maintenance": "HomeServicesAndMaintenanceLeads",
  "Real Estate & Property Services": "RealEstateAndPropertyServicesLeads",
  "Business & Professional Services": "BusinessAndProfessionalServicesLeads",
  "Hospitality & Travel": "HospitalityAndTravelLeads",
  "Manufacturing & Industrial": "ManufacturingAndIndustrialLeads",
  "Agriculture & Organic Business": "AgricultureAndOrganicBusinessLeads",
  "E-Commerce & Technology": "ECommerceAndTechnologyLeads",
  "Entertainment & Recreation": "EntertainmentAndRecreationLeads",
  "Logistics & Transportation": "LogisticsAndTransportationLeads",
  "Clean Tech & Environment": "CleanTechAndEnvironmentLeads",
  "Social Impact & NGO": "SocialImpactAndNGOLeads",
  "Pet Care & Other Emerging Sectors": "PetCareAndOtherEmergingSectorsLeads",
};


export const instaApplyBrandFormController = async (req, res) => {
  try {
    const {
      fullName,
      email,
      mobileNumber,
      state,
      district,
      city,
      investmentRange,
      planToInvest,
      readyToInvest,
      brandId,
      brandName,
      applyId,
    } = req.body;

    // console.log("req.body :", req.body);

    // Use aggregation to fetch brand data from all three collections
    const brandAggregate = await BrandDetails.aggregate([
      {
        $match: { uuid: brandId },
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
          from: "brandexpansionlocationdata",
          localField: "uuid",
          foreignField: "brandOwnerId",
          as: "expansionLocationData",
        },
      },
      {
        $lookup: {
          from: "branduploads", // This is the missing lookup
          localField: "uuid",
          foreignField: "brandOwnerId",
          as: "uploads",
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
          path: "$expansionLocationData",
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
        $limit: 1,
      },
    ]);

    // console.log("brandAggregate :", brandAggregate);

    if (!brandAggregate || brandAggregate.length === 0) {
      return res.json(new ApiResponse(404, null, "Brand not found"));
    }

    const exists = brandAggregate[0];

    // Determine who is applying (Investor / Brand / other)
    let applyBy = "other";
    let applyById = "other";

    const isBrand = await BrandDetails.findOne({ uuid: applyId });
    if (isBrand) {
      applyBy = "Brand";
      applyById = isBrand?.uuid;
    } else {
      const isInvestor = await InvsRegister.findOne({ uuid: applyId });
      if (isInvestor) {
        applyBy = "Investor";
        applyById = isInvestor?.uuid;
      }
    }

    const leadsres = await leadsCreateFunction(req?.body,exists,applyBy,applyById)
    // console.log("leadsres :",leadsres)
    res.json(leadsres)

    const { main, sub, child } =
      exists.franchiseDetails?.franchiseDetails?.brandCategories || {};
    // console.log("main, sub, child :", main, sub, child);

    // const newSubmission = new instantApply({
    //   uuid: uuid(),
    //   fullName,
    //   email,
    //   mobileNumber,
    //   Categories:
    //     exists.franchiseDetails?.franchiseDetails?.brandCategories.main || {},
    //   state,
    //   district,
    //   city,
    //   investmentRange,
    //   planToInvest,
    //   readyToInvest,
    //   brandId,
    //   brandName,
    //   brandEmail: exists.brandDetails?.email,
    //   brandLogo: exists.uploads?.uploads?.brandLogo?.[0],
    //   apply: {
    //     applyBy,
    //     applyId: applyById,
    //   },
    // });

    // await newSubmission.save();
    // console.log("newSubmission :", newSubmission);

    // if (!newSubmission) {
    //   return res.json(
    //     new ApiResponse(
    //       500,
    //       null,
    //       "Something went wrong while newSubmission saving in database"
    //     )
    //   );
    // }

    // res.json(
    //   new ApiResponse(200, newSubmission, "Application submitted successfully")
    // );

    await instantApplyLocationMatch(
      fullName,
      email,
      mobileNumber,
      brandName,
      brandId,
      exists.brandDetails?.email,
      main,
      sub,
      child,
      state,
      district,
      city,
      investmentRange,
      planToInvest,
      readyToInvest,
      applyBy,
      applyById,
      exists.uploads?.uploads?.brandLogo
    );
  } catch (error) {
    console.error("Error in instaApplyBrandFormController:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Internal server error"));
  }
};

// // Get all

export const getAllInstaApplyToBrand = async (req, res) => {
  const { id } = req.params;
  const BrandData = req.brandUser;

  if (!id || id !== BrandData?.uuid) {
    return res
      .status(401)
      .json(new ApiResponse(401, {}, "Unauthorized request"));
  }

  try {
    // Fetch instant applications with proper error handling
    const instaApply = await InstantApplyLead.find({
      "initialBrand.brandId": BrandData.uuid,
    })
      .select("-_id -__v")
      .sort({ createdAt: -1 })
      .lean();
    console.log("instaApply:", instaApply);

    // Process applications in parallel for better performance
    const applyList = await Promise.all(
      instaApply.map(async (application) => {
        try {
          let data = await InvsRegister.findOne({
            uuid: application.apply?.applyId,
          })
            .select("-_id -oldData")
            .lean();

          if (!data) {
            data = await BrandListing.findOne({
              uuid: application.apply?.applyId,
            }).lean();
          }

          return data ? { ...application, userData: data } : application;
        } catch (error) {
          console.error(
            `Error processing application ${application._id}:`,
            error
          );
          return application;
        }
      })
    );

    return res.json(
      new ApiResponse(
        200,
        applyList,
        "All instant apply applications fetched successfully"
      )
    );
  } catch (error) {
    console.error("Error in getAllInstaApplyToBrand:", error);
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          null,
          `Error fetching Insta Apply: ${error.message}`
        )
      );
  }
};

// Get Instant Apply Location Lead Controller by ID

export const getInstantApplyLocationLeadControllerById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await BrandDetails.findOne({ uuid: id });

    // Use aggregation to find and reshape the data
    // const instantApplie = await InstantApplyInvestor.aggregate([
    //   // Match documents that have the brandId in their brandsSent array
    //   {
    //     $match: {
    //       'brandsSent.brandId': id
    //     }
    //   },
    //   // Unwind the brandsSent array to filter by brandId
    //   {
    //     $unwind: '$brandsSent'
    //   },
    //   // Match only the specific brandId entries
    //   {
    //     $match: {
    //       'brandsSent.brandId': id
    //     }
    //   },
    //   // Group back to reconstruct the original document structure
    //   {
    //     $group: {
    //       _id: '$_id',
    //       location: { $first: '$location' },
    //       apply: { $first: '$apply' },
    //       investorEmail: { $first: '$investorEmail' },
    //       investorName: { $first: '$investorName' },
    //       investorPhone: { $first: '$investorPhone' },
    //       category: { $first: '$category' },
    //       investmentRange: { $first: '$investmentRange' },
    //       planToInvest: { $first: '$planToInvest' },
    //       readyToInvest: { $first: '$readyToInvest' },
    //       brandsSent: { $push: '$brandsSent' },
    //       createdAt: { $first: '$createdAt' },
    //       updatedAt: { $first: '$updatedAt' },
    //       __v: { $first: '$__v' }
    //     }
    //   },
    //   // Project to include only the required fields
    //   {
    //     $project: {
    //       'location.state': 1,
    //       'location.city': 1,
    //       'location.district': 1,
    //       investorEmail: 1,
    //       investorName: 1,
    //       investorPhone: 1,
    //       category: {
    //         main: { $arrayElemAt: ['$category.main', 0] },
    //         sub: { $arrayElemAt: ['$category.sub', 0] },
    //         child: { $arrayElemAt: ['$category.child', 0] }
    //       },
    //       investmentRange: 1,
    //       planToInvest: 1,
    //       readyToInvest: 1,
    //       brandsSent: 1
    //     }
    //   }
    // ]);

    // const instantApplie = await InstantApplyInvestor.find({
    //   // "brandsSent.brandId": user._id

    // });
    const instantApplie = await InstantApplyInvestor.aggregate([
      {
        $match: { "brandsSent.brandId": user.uuid },
      },
      {
        $project: {
          _id: 0,
          investorName: 1,
          investorEmail: 1,
          investorPhone: 1,
          "category.main": { $arrayElemAt: ["$category.main", 0] },
          "category.sub": { $arrayElemAt: ["$category.sub", 0] },
          "category.child": { $arrayElemAt: ["$category.child", 0] },
          "location.state": 1,
          "location.district": 1,
          "location.city": 1,
          investmentRange: 1,
          planToInvest: 1,
          readyToInvest: 1,
          apply: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    if (!instantApplie || instantApplie.length === 0) {
      return res
        .status(404)
        .json(
          new ApiResponse(
            404,
            [],
            "No instant apply records found for this brand"
          )
        );
    }

    return res.json(
      new ApiResponse(
        200,
        instantApplie,
        "Instant apply records fetched successfully"
      )
    );
  } catch (error) {
    console.error("Error in getInstantApplyLocationLeadControllerById:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Internal server error"));
  }
};
//Get By Id

export const getInstaApplyById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.investorUser || req.brandUser;

    if (!user || id !== user?.uuid) {
      return res
        .status(401)
        .json(new ApiResponse(401, {}, "Unauthorized request"));
    }

    const myInstaApplies = await instantApply.find({
      "apply.applyId": user.uuid,
    });

    if (!myInstaApplies || myInstaApplies.length === 0) {
      return res.json(
        new ApiResponse(404, {}, "User hasn't applied to any brand yet")
      );
    }

    // Fetch brand info for each application in parallel
    const applyList = await Promise.all(
      myInstaApplies.map(async (application) => {
        const brand = await BrandListing.findOne({
          uuid: application.brandId,
        }).lean();
        return {
          application,
          brand: brand || null,
        };
      })
    );

    // Reverse for latest first
    const reverse = applyList.reverse();
    return res.json(
      new ApiResponse(200, reverse, "Apply list fetched successfully")
    );
  } catch (error) {
    console.error("Error in getInstaApplyById:", error);
    return res.json(new ApiResponse(500, null, "Error fetching Insta Apply"));
  }
};

// Update
export const updateInstaApply = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fullName,
      location,
      investmentRange,
      planToInvest,
      readyToInvest,
      brandId,
      brandName,
      brandEmail,
      investorEmail,
      mobileNumber,
    } = req.body;

    const updatedInstaApply = await instaApplyBrandForm.findByIdAndUpdate(
      id,
      {
        fullName,
        location,
        investmentRange,
        planToInvest,
        readyToInvest,
        brandId,
        brandName,
        brandEmail,
        investorEmail,
        mobileNumber,
      },
      { new: true }
    );

    if (!updatedInstaApply) {
      return res.status(404).json({ message: "Insta Apply not found" });
    }
    res.status(200).json({
      message: "Insta Apply updated successfully",
      data: updatedInstaApply,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating Insta Apply", error: error.message });
  }
};

// Delete
export const deleteInstaApply = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedInstaApply = await instaApplyBrandForm.findByIdAndDelete(id);
    if (!deletedInstaApply) {
      return res.status(404).json({ message: "Insta Apply not found" });
    }
    res.status(200).json({
      message: "Insta Apply deleted successfully",
      data: deletedInstaApply,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting Insta Apply", error: error.message });
  }
};

export const getAllLeads = async (req, res) => {
  const { id } = req.params;
  const BrandData = req.brandUser;

  if (!id || id !== BrandData?.uuid) {
    return res
      .status(401)
      .json(new ApiResponse(401, {}, "Unauthorized request"));
  }

  const leads = await InstantApplyLead.find({
    "brandMatches.brandId": new mongoose.Types.ObjectId(BrandData.uuid),
  })
    .select("-_id -__v")
    .sort({ createdAt: -1 })
    .lean();
  console.log("instaApply:", leads.length);
  return res.json(
    new ApiResponse(
      200,
      leads,
      "All instant apply applications fetched successfully"
    )
  );
};

export const getAllInstantApply = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    console.log(req.admin.uuid);

    if (id !== req.admin.uuid) {
      return res.json(new ApiResponse(401, {}, "Unauthorized request"));
    }

    const total = await instantApply.countDocuments();

    const data = await instantApply
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          success: true,
          data,
          pagination: {
            total,
            page,
            pages: Math.ceil(total / limit),
            limit,
          },
        },
        "Instant Apply Fetch Successfully"
      )
    );
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getInstantApplyDropDownData = async (req, res) => {
  try {
    const { id } = req.params;
    const userId =
      req?.admin?.uuid || req.investorUser?.uuid || req.brandUser?.uuid;

    if (!userId) {
      return res.json(new ApiResponse(401, {}, "Unauthorized request"));
    }

    const docs = await instantApply.find({});

    const states = new Set();
    const districts = new Set();
    const cities = new Set();
    const investmentRanges = new Set();

    docs.forEach((doc) => {
      if (doc.state) states.add(doc.state);
      if (doc.district) districts.add(doc.district);
      if (doc.city) cities.add(doc.city);
      if (doc.investmentRange) investmentRanges.add(doc.investmentRange);
    });

    const responseData = {
      states: [...states],
      districts: [...districts],
      cities: [...cities],
      investmentRanges: [...investmentRanges],
    };

    return res.json(
      new ApiResponse(200, responseData, "Dropdown data fetched successfully")
    );
  } catch (error) {
    console.error("Error in getInstantApplyDropDownData:", error);
    return res.json(new ApiResponse(500, {}, "Internal Server Error"));
  }
};

export const getInstantApplySearchData = async (req, res) => {
  try {
    const { id } = req.params;
    const userId =
      req?.admin?.uuid || req?.investorUser?.uuid || req?.brandUser?.uuid;

    const {
      searchTerm,
      state,
      district,
      city,
      investmentRange,
      fromDate,
      toDate,
    } = req.body.payload || {};

    const page = req.body?.payload?.page || 1;
    const limit = req.body?.payload?.limit || 10;
    const skip = (page - 1) * limit;
    // console.log(skip)

    if (!userId) {
      return res.json(new ApiResponse(401, {}, "Unauthorized request"));
    }

    let query = {};
    let docs = [];
    let responseData = {};
    let totalPages = 0;
    let stopPagination

    // Sets for unique filters
    const states = new Set();
    const districts = new Set();
    const cities = new Set();
    const investmentRanges = new Set();

    if (fromDate || toDate) {
      let start, end;
      if (fromDate) {
        const parsed = new Date(fromDate);
        if (!isNaN(parsed)) {
          start = parsed;
          start.setHours(0, 0, 0, 0);
        }
      }

      if (toDate) {
        const parsed = new Date(toDate);
        if (!isNaN(parsed)) {
          end = parsed;
          end.setHours(23, 59, 59, 999);
        }
      }

      const query = {};
      if (start && end) {
        query.createdAt = { $gte: start, $lte: end };
      } else if (start) {
        query.createdAt = { $gte: start };
      } else if (end) {
        query.createdAt = { $lte: end };
      }

      const data = await instantApply
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      totalPages = await instantApply.countDocuments(query);

      if (!data || data.length === 0) {
        return res.json(
          new ApiResponse(
            404,
            [],
            "No applications found for the selected date range"
          )
        );
      }

      const responseData = {
        data,
        pagination: {
          currentPage: page,
          limit,
          totalPages,
        },
      };

      return res.json(
        new ApiResponse(200, responseData, "Data fetched successfully")
      );
    }

    // Search term filter
    if (searchTerm) {
      query.$or = [{ brandName: { $regex: searchTerm, $options: "i" } }];
      docs = await instantApply
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      totalPages = await instantApply.countDocuments({});
      responseData = {
        data: docs,
        pagination: {
          currentPage: page,
          limit,
          totalPages,
        },
      };
      return res.json(
        new ApiResponse(200, responseData, "Search data fetched successfully")
      );
    }

    if (state && district && city && investmentRange) {
      query = { state, district, city, investmentRange };
      docs = await instantApply
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      totalPages = await instantApply.countDocuments({});
      if (docs.length === 0) {
        query = { state, district, city };
        docs = await instantApply
          .find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit);
        totalPages = await instantApply.countDocuments({});
        if (docs.length === 0) {
          query = { state, district };
          docs = await instantApply
            .find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
          totalPages = await instantApply.countDocuments({});
          if (docs.length === 0) {
            docs = await instantApply.find({ state });
            totalPages = await instantApply.countDocuments({});
            docs.forEach((doc) => {
              if (doc.city) cities.add(doc.city);
              if (doc.district) districts.add(doc.district);
              if (doc.investmentRange)
                investmentRanges.add(doc.investmentRange);
            });

            responseData = {
              investmentRanges: [...investmentRanges],
              cities: [...cities],
              districts: [...districts],
              data: docs,
              pagination: {
                currentPage: page,
                limit,
                totalPages,
              },
            };
            return res.json(
              new ApiResponse(
                200,
                responseData,
                "Search data fetched successfully"
              )
            );
          }

          docs.forEach((doc) => {
            if (doc.city) cities.add(doc.city);
            if (doc.investmentRange) investmentRanges.add(doc.investmentRange);
          });

          responseData = {
            investmentRanges: [...investmentRanges],
            cities: [...cities],
            data: docs,
            pagination: {
              currentPage: page,
              limit,
              totalPages,
            },
          };
          return res.json(
            new ApiResponse(
              200,
              responseData,
              "Search data fetched successfully"
            )
          );
        }

        docs.forEach((doc) => {
          if (doc.investmentRange) investmentRanges.add(doc.investmentRange);
        });

        responseData = {
          investmentRanges: [...investmentRanges],
          data: docs,
          pagination: {
            currentPage: page,
            limit,
            totalPages,
          },
        };
        return res.json(
          new ApiResponse(200, responseData, "Search data fetched successfully")
        );
      }

      responseData = {
        data: docs,
        pagination: {
          currentPage: page,
          limit,
          totalPages,
        },
      };
      return res.json(
        new ApiResponse(200, responseData, "Search data fetched successfully")
      );
    }

    if (state && district && city) {
      query = { state, district, city };
      docs = await instantApply
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      totalPages = await instantApply.countDocuments({});
      if (docs.length === 0) {
        query = { state, district };
        docs = await instantApply
          .find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit);
        totalPages = await instantApply.countDocuments({});
        if (docs.length === 0) {
          docs = await instantApply.find({ state });
          totalPages = await instantApply.countDocuments({});
          docs.forEach((doc) => {
            if (doc.city) cities.add(doc.city);
            if (doc.district) districts.add(doc.district);
            if (doc.investmentRange) investmentRanges.add(doc.investmentRange);
          });

          responseData = {
            investmentRanges: [...investmentRanges],
            cities: [...cities],
            districts: [...districts],
            data: docs,
            pagination: {
              currentPage: page,
              limit,
              totalPages,
            },
          };
          return res.json(
            new ApiResponse(
              200,
              responseData,
              "Search data fetched successfully"
            )
          );
        }

        docs.forEach((doc) => {
          if (doc.city) cities.add(doc.city);
          if (doc.investmentRange) investmentRanges.add(doc.investmentRange);
        });

        responseData = {
          investmentRanges: [...investmentRanges],
          cities: [...cities],
          data: docs,
          pagination: {
            currentPage: page,
            limit,
            totalPages,
          },
        };
        return res.json(
          new ApiResponse(200, responseData, "Search data fetched successfully")
        );
      }

      docs.forEach((doc) => {
        if (doc.investmentRange) investmentRanges.add(doc.investmentRange);
      });

      responseData = {
        investmentRanges: [...investmentRanges],
        data: docs,
        pagination: {
          currentPage: page,
          limit,
          totalPages,
        },
      };
      return res.json(
        new ApiResponse(200, responseData, "Search data fetched successfully")
      );
    }

    if (state && district && investmentRange) {
      query = { state, district, investmentRange };
      docs = await instantApply
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      totalPages = await instantApply.countDocuments({});

      if (docs.length === 0) {
        query = { state, district };
        docs = await instantApply
          .find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit);
        totalPages = await instantApply.countDocuments({});
        if (docs.length === 0) {
          docs = await instantApply.find({ state });
          totalPages = await instantApply.countDocuments({});
          docs.forEach((doc) => {
            if (doc.city) cities.add(doc.city);
            if (doc.district) districts.add(doc.district);
            if (doc.investmentRange) investmentRanges.add(doc.investmentRange);
          });

          responseData = {
            investmentRanges: [...investmentRanges],
            cities: [...cities],
            districts: [...districts],
            data: docs,
            pagination: {
              currentPage: page,
              limit,
              totalPages,
            },
          };
          return res.json(
            new ApiResponse(
              200,
              responseData,
              "Search data fetched successfully"
            )
          );
        }

        docs.forEach((doc) => {
          if (doc.city) cities.add(doc.city);
          if (doc.investmentRange) investmentRanges.add(doc.investmentRange);
        });

        responseData = {
          investmentRanges: [...investmentRanges],
          cities: [...cities],
          data: docs,
          pagination: {
            currentPage: page,
            limit,
            totalPages,
          },
        };
        return res.json(
          new ApiResponse(200, responseData, "Search data fetched successfully")
        );
      }
      responseData = {
        data: docs,
        pagination: {
          currentPage: page,
          limit,
          totalPages,
        },
      };
      return res.json(
        new ApiResponse(200, responseData, "Search data fetched successfully")
      );
    }

    if (district && city && investmentRange) {
      query = { district, city, investmentRange };
      docs = await instantApply
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      totalPages = await instantApply.countDocuments({});
      if (docs.length === 0) {
        query = { district, city };
        docs = await instantApply
          .find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit);
        totalPages = await instantApply.countDocuments({});
        if (docs.length === 0) {
          docs = await instantApply.find({ district });
          totalPages = await instantApply.countDocuments({});
          docs.forEach((doc) => {
            if (doc.city) cities.add(doc.city);
            if (doc.investmentRange) investmentRanges.add(doc.investmentRange);
          });

          responseData = {
            investmentRanges: [...investmentRanges],
            cities: [...cities],
            data: docs,
            pagination: {
              currentPage: page,
              limit,
              totalPages,
            },
          };
          return res.json(
            new ApiResponse(
              200,
              responseData,
              "Search data fetched successfully"
            )
          );
        }

        docs.forEach((doc) => {
          if (doc.city) cities.add(doc.city);
          if (doc.investmentRange) investmentRanges.add(doc.investmentRange);
        });

        responseData = {
          investmentRanges: [...investmentRanges],
          cities: [...cities],
          data: docs,
          pagination: {
            currentPage: page,
            limit,
            totalPages,
          },
        };
        return res.json(
          new ApiResponse(200, responseData, "Search data fetched successfully")
        );
      }

      responseData = {
        data: docs,
        pagination: {
          currentPage: page,
          limit,
          totalPages,
        },
      };
      return res.json(
        new ApiResponse(200, responseData, "Search data fetched successfully")
      );
    }

    if (state && city && investmentRange) {
      query = { state, city, investmentRange };
      docs = await instantApply
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      totalPages = await instantApply.countDocuments({});

      if (docs.length === 0) {
        query = { state, city };
        docs = await instantApply
          .find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit);
        totalPages = await instantApply.countDocuments({});
        if (docs.length === 0) {
          docs = await instantApply.find({ state });
          totalPages = await instantApply.countDocuments({});
          docs.forEach((doc) => {
            if (doc.city) cities.add(doc.city);
            if (doc.district) districts.add(doc.district);
            if (doc.investmentRange) investmentRanges.add(doc.investmentRange);
          });

          responseData = {
            investmentRanges: [...investmentRanges],
            cities: [...cities],
            districts: [...districts],
            data: docs,
            pagination: {
              currentPage: page,
              limit,
              totalPages,
            },
          };
          return res.json(
            new ApiResponse(
              200,
              responseData,
              "Search data fetched successfully"
            )
          );
        }

        docs.forEach((doc) => {
          if (doc.city) cities.add(doc.city);
          if (doc.investmentRange) investmentRanges.add(doc.investmentRange);
        });

        responseData = {
          investmentRanges: [...investmentRanges],
          cities: [...cities],
          data: docs,
          pagination: {
            currentPage: page,
            limit,
            totalPages,
          },
        };
        return res.json(
          new ApiResponse(200, responseData, "Search data fetched successfully")
        );
      }
      responseData = {
        data: docs,
        pagination: {
          currentPage: page,
          limit,
          totalPages,
        },
      };
      return res.json(
        new ApiResponse(200, responseData, "Search data fetched successfully")
      );
    }

    // Case 1: state + district
    if (state && district) {
      query = { state, district };

      docs = await instantApply
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      totalPages = await instantApply.countDocuments({});

      if (docs.length === 0) {
        docs = await instantApply.find({ state });
        docs.forEach((doc) => {
          if (doc.city) cities.add(doc.city);
          if (doc.district) districts.add(doc.district);
          if (doc.investmentRange) investmentRanges.add(doc.investmentRange);
        });

        responseData = {
          investmentRanges: [...investmentRanges],
          cities: [...cities],
          districts: [...districts],
          data: docs,
          pagination: {
            currentPage: page,
            limit,
            totalPages,
          },
        };
        return res.json(
          new ApiResponse(200, responseData, "Search data fetched successfully")
        );
      }

      docs.forEach((doc) => {
        if (doc.city) cities.add(doc.city);
        if (doc.investmentRange) investmentRanges.add(doc.investmentRange);
      });

      responseData = {
        investmentRanges: [...investmentRanges],
        data: docs,
        pagination: {
          currentPage: page,
          limit,
          totalPages,
        },
      };
      return res.json(
        new ApiResponse(200, responseData, "Search data fetched successfully")
      );
    }

    // Case 2: state + city
    if (state && city) {
      query = { state, city };
      docs = await instantApply
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      totalPages = await instantApply.countDocuments({});
      if (docs.length === 0) {
        docs = await instantApply.find({ state });
        docs.forEach((doc) => {
          if (doc.city) cities.add(doc.city);
          if (doc.district) districts.add(doc.district);
          if (doc.investmentRange) investmentRanges.add(doc.investmentRange);
        });

        responseData = {
          investmentRanges: [...investmentRanges],
          cities: [...cities],
          districts: [...districts],
          data: docs,
          pagination: {
            currentPage: page,
            limit,
            totalPages,
          },
        };
        return res.json(
          new ApiResponse(200, responseData, "Search data fetched successfully")
        );
      }

      docs.forEach((doc) => {
        if (doc.investmentRange) investmentRanges.add(doc.investmentRange);
      });

      responseData = {
        investmentRanges: [...investmentRanges],
        data: docs,
        pagination: {
          currentPage: page,
          limit,
          totalPages,
        },
      };
      return res.json(
        new ApiResponse(200, responseData, "Search data fetched successfully")
      );
    }

    // Case 3: state + investmentRange
    if (state && investmentRange) {
      query = { state, investmentRange };
      docs = await instantApply
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      totalPages = await instantApply.countDocuments({});
      if (docs.length === 0) {
        docs = await instantApply.find({ state });
        docs.forEach((doc) => {
          if (doc.city) cities.add(doc.city);
          if (doc.district) districts.add(doc.district);
          if (doc.investmentRange) investmentRanges.add(doc.investmentRange);
        });

        responseData = {
          investmentRanges: [...investmentRanges],
          cities: [...cities],
          districts: [...districts],
          data: docs,
          pagination: {
            currentPage: page,
            limit,
            totalPages,
          },
        };
        return res.json(
          new ApiResponse(200, responseData, "Search data fetched successfully")
        );
      }

      responseData = {
        data: docs,
        pagination: {
          currentPage: page,
          limit,
          totalPages,
        },
      };
      return res.json(
        new ApiResponse(200, responseData, "Search data fetched successfully")
      );
    }

    // Case 4: district + investmentRange
    if (district && investmentRange) {
      query = { district, investmentRange };
      docs = await instantApply
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      totalPages = await instantApply.countDocuments({});
      if (docs.length === 0) {
        docs = await instantApply.find({ district });
        docs.forEach((doc) => {
          if (doc.city) cities.add(doc.city);
          if (doc.investmentRange) investmentRanges.add(doc.investmentRange);
        });

        responseData = {
          investmentRanges: [...investmentRanges],
          cities: [...cities],
          data: docs,
          pagination: {
            currentPage: page,
            limit,
            totalPages,
          },
        };
        return res.json(
          new ApiResponse(200, responseData, "Search data fetched successfully")
        );
      }

      responseData = {
        data: docs,
        pagination: {
          currentPage: page,
          limit,
          totalPages,
        },
      };
      return res.json(
        new ApiResponse(200, responseData, "Search data fetched successfully")
      );
    }

    // Case 5: district + city
    if (district && city) {
      query = { district, city };
      docs = await instantApply
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      totalPages = await instantApply.countDocuments({});
      if (docs.length === 0) {
        docs = await instantApply.find({ district });
        docs.forEach((doc) => {
          if (doc.city) cities.add(doc.city);
          if (doc.investmentRange) investmentRanges.add(doc.investmentRange);
        });

        responseData = {
          investmentRanges: [...investmentRanges],
          cities: [...cities],
          data: docs,
          pagination: {
            currentPage: page,
            limit,
            totalPages,
          },
        };
        return res.json(
          new ApiResponse(200, responseData, "Search data fetched successfully")
        );
      }

      docs.forEach((doc) => {
        if (doc.investmentRange) investmentRanges.add(doc.investmentRange);
      });

      responseData = {
        investmentRanges: [...investmentRanges],
        data: docs,
        pagination: {
          currentPage: page,
          limit,
          totalPages,
        },
      };
      return res.json(
        new ApiResponse(200, responseData, "Search data fetched successfully")
      );
    }

    // Case 6: investmentRange + city
    if (investmentRange && city) {
      query = { investmentRange, city };
      docs = await instantApply
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      totalPages = await instantApply.countDocuments({});

      if (docs.length === 0) {
        docs = await instantApply.find({ city });
        docs.forEach((doc) => {
          // if (doc.city) cities.add(doc.city);
          if (doc.investmentRange) investmentRanges.add(doc.investmentRange);
        });

        responseData = {
          investmentRanges: [...investmentRanges],
          // cities: [...cities],
          data: docs,
          pagination: {
            currentPage: page,
            limit,
            totalPages,
          },
        };
        return res.json(
          new ApiResponse(200, responseData, "Search data fetched successfully")
        );
      }

      responseData = {
        data: docs,
        pagination: {
          currentPage: page,
          limit,
          totalPages,
        },
      };
      return res.json(
        new ApiResponse(200, responseData, "Search data fetched successfully")
      );
    }

    // Default case: single filters
    if (state) {
      query = { state };
      docs = await instantApply
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      totalPages = await instantApply.countDocuments({});
      docs.forEach((doc) => {
        if (doc.investmentRange) investmentRanges.add(doc.investmentRange);
        if (doc.city) cities.add(doc.city);
        if (doc.district) districts.add(doc.district);
      });

      responseData = {
        investmentRanges: [...investmentRanges],
        districts: [...districts],
        cities: [...cities],
        data: docs,
        pagination: {
          currentPage: page,
          limit,
          totalPages,
        },
      };
      return res.json(
        new ApiResponse(200, responseData, "Search data fetched successfully")
      );
    }

    if (district) {
      query = { district };
      docs = await instantApply
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      totalPages = await instantApply.countDocuments({});
      docs.forEach((doc) => {
        if (doc.city) cities.add(doc.city);
        if (doc.investmentRange) investmentRanges.add(doc.investmentRange);
      });

      responseData = {
        cities: [...cities],
        investmentRanges: [...investmentRanges],
        data: docs,
        pagination: {
          currentPage: page,
          limit,
          totalPages,
        },
      };
      return res.json(
        new ApiResponse(200, responseData, "Search data fetched successfully")
      );
    }

    if (city) {
      query = { city };
      docs = await instantApply
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      totalPages = await instantApply.countDocuments({});
      docs.forEach((doc) => {
        if (doc.investmentRange) investmentRanges.add(doc.investmentRange);
      });

      responseData = {
        investmentRanges: [...investmentRanges],
        data: docs,
        pagination: {
          currentPage: page,
          limit,
          totalPages,
        },
      };
      return res.json(
        new ApiResponse(200, responseData, "Search data fetched successfully")
      );
    }

    if (investmentRange) {
      query = { investmentRange };
      docs = await instantApply
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      totalPages = await instantApply.countDocuments({});
      responseData = {
        data: docs,
        pagination: {
          currentPage: page,
          limit,
          totalPages,
        },
      };
      return res.json(
        new ApiResponse(200, responseData, "Search data fetched successfully")
      );
    }

    // Default: fetch all
    docs = await instantApply
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    totalPages = await instantApply.countDocuments({});

    stopPagination = Math.ceil(totalPages/limit) 
    if (page >= stopPagination) {
      stopPagination = true;
    } else {
      stopPagination = false;
    }
    responseData = {
      data: docs,
      pagination: {
        currentPage: page,
        limit,
        totalPages,
        stopPagination
      },
    };
    return res.json(
      new ApiResponse(200, responseData, "Search data fetched successfully")
    );
  } catch (error) {
    console.error("Error in getInstantApplySearchData:", error);
    return res.json(new ApiResponse(500, {}, "Internal Server Error"));
  }
};



