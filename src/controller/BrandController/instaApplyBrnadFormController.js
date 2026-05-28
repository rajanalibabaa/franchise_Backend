// import { instantApply } from "../../model/Brand/brandFranchiseApply.js";
// import uuid from "../../utils/uuid.js";
// import { sendInstantApplyEmail } from "../../utils/Centralized Email/centralizedEmail.js";
// import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";
// import BrandListing from "../../model/Brand/brandListingPage.js";
// import { InvsRegister } from "../../model/Investor/invsRegister.js";
// import { instantApplyPerfectAndPartial } from "../../utils/AllLeads/instantApplyPerfectAndPartial.js";
// import InstantApplyLead from "../../model/NewIncomeInvestor/instantApplyPerfectAndPartial.js";
// import mongoose, { Aggregate } from "mongoose";
// import { handleNewleads } from "../../utils/AllLeads/handleNewleads.js";
// // import { EmailTrackingService } from '../../model/NewIncomeInvestor/BrandEmailCountSchema.js';r
// import { BrandDetails } from "../../model/Brand/Brand.model/BrandDetails.model.js";
// // import InstantApplyInvestor from "../../model/NewIncomeInvestor/InstantApplyLocationSchema.js";
// import { leadsCreateFunction } from "../Leads/leadsCreateFunction.js";



// export const instaApplyBrandFormController = async (req, res) => {
//   try {
//     const {
//       fullName,
//       email,
//       mobileNumber,
//       state,
//       district,
//       city,
//       investmentRange,
//       planToInvest,
//       readyToInvest,
//       brandId,
//       brandName,
//       applyId,
//     } = req.body;

//     console.log(" from apply from brand investment enquiry req.body :", req.body);

//     // Use aggregation to fetch brand data from all three collections
//     const brandAggregate = await BrandDetails.aggregate([
//       {
//         $match: { uuid: brandId },
//       },
//       {
//         $lookup: {
//           from: "brandfranchisedetails",
//           localField: "uuid",
//           foreignField: "brandOwnerId",
//           as: "franchiseDetails",
//         },
//       },
//       {
//         $lookup: {
//           from: "brandexpansionlocationdata",
//           localField: "uuid",
//           foreignField: "brandOwnerId",
//           as: "expansionLocationData",
//         },
//       },
//       {
//         $lookup: {
//           from: "branduploads", // This is the missing lookup
//           localField: "uuid",
//           foreignField: "brandOwnerId",
//           as: "uploads",
//         },
//       },
//       {
//         $unwind: {
//           path: "$franchiseDetails",
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       {
//         $unwind: {
//           path: "$expansionLocationData",
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       {
//         $unwind: {
//           path: "$uploads",
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       {
//         $limit: 1,
//       },
//     ]);

//     // console.log("brandAggregate :", brandAggregate);

//     if (!brandAggregate || brandAggregate.length === 0) {
//       return res.json(new ApiResponse(404, null, "Brand not found"));
//     }

//     const exists = brandAggregate[0];

//     // Determine who is applying (Investor / Brand / Other)
//     let applyBy = "Other"; // Changed from "other" to "Other" to match enum
//     let applyById = "Other"; // Changed from "other" to "Other" to match enum

//     const isBrand = await BrandDetails.findOne({ uuid: applyId });
//     if (isBrand) {
//       applyBy = "Brand";
//       applyById = isBrand?.uuid;
//     } else {
//       const isInvestor = await InvsRegister.findOne({ uuid: applyId });
//       if (isInvestor) {
//         applyBy = "Investor";
//         applyById = isInvestor?.uuid;
//       }
//     }

//     // Save the incoming brand apply form submission first
//     const newSubmission = new instantApply({
//       uuid: uuid(),
//       fullName,
//       email,
//       mobileNumber,
//       state,
//       district,
//       city,
//       investmentRange,
//       planToInvest,
//       readyToInvest,
//       brandId,
//       brandName,
//       brandEmail: exists.brandDetails?.email,
//       brandLogo: exists.uploads?.uploads?.brandLogo?.[0] || null,
//       apply: {
//         applyBy,
//         applyId: applyById,
//       },
//     });

//     const savedSubmission = await newSubmission.save();
//     if (!savedSubmission) {
//       return res.json(
//         new ApiResponse(
//           500,
//           null,
//           "Something went wrong while saving the brand form submission",
//         ),
//       );
//     }


//     return res.status(leadsres?.statuscode || 200).json(leadsres);
//   } catch (error) {
//     console.error("Error in instaApplyBrandFormController:", error);
//     // Only send response if headers haven't been sent yet
//     if (!res.headersSent) {
//       return res
//         .status(500)
//         .json(new ApiResponse(500, {}, "Internal server error"));
//     }
//   }
// };

// // Get leads by industry
// export const getLeadsByIndustryController = async (req, res) => {
//   try {
//     const { schema } = req.params;
//     const {
//       page = 1,
//       limit = 100,
//       brandId,
//       investorEmail,
//       fullName,
//       investorMobileNumber, // Added mobile search
//       state,
//       city,
//       district,
//       investmentRange,
//       category,
//       industry, // Added industry filter
//       subCategory, // Added sub-category filter
//       applyBy,
//       planToInvest, // Added plan to invest filter
//       readyToInvest, // Added ready to invest filter
//       enquiryVia, // Added enquiry via filter
//       sortBy = "createdAt",
//       sortOrder = "desc",
//       // Date range filters
//       startDate,
//       endDate,
//       // Search across multiple fields
//       search, // Global search parameter
//     } = req.query;

//     // console.log("Received query params:", req.query);

//     // Check if the schema/model exists in mongoose(industry)
//     const modelNames = mongoose.modelNames();

//     if (!modelNames.includes(schema)) {
//       return res
//         .status(400)
//         .json(
//           new ApiResponse(
//             400,
//             null,
//             `Invalid schema name. Available schemas: ${modelNames.join(", ")}`,
//           ),
//         );
//     }

//     // Dynamically use the Mongoose model
//     const Model = mongoose.model(schema);

//     // Build filter object dynamically
//     const filter = {};

//     // Brand filter
//     if (brandId) filter.brandId = brandId;

//     // Global search across multiple fields
//     if (search) {
//       filter.$or = [
//         { fullName: { $regex: search, $options: "i" } },
//         { investorEmail: { $regex: search, $options: "i" } },
//         { investorMobileNumber: { $regex: search, $options: "i" } },
//         { brandName: { $regex: search, $options: "i" } },
//         { state: { $regex: search, $options: "i" } },
//         { city: { $regex: search, $options: "i" } },
//       ];
//     } else {
//       // Individual field searches (only if global search is not used)
//       if (investorEmail) {
//         filter.investorEmail = { $regex: investorEmail, $options: "i" };
//       }

//       if (fullName) {
//         filter.fullName = { $regex: fullName, $options: "i" };
//       }

//       if (investorMobileNumber) {
//         filter.investorMobileNumber = {
//           $regex: investorMobileNumber,
//           $options: "i",
//         };
//       }
//     }

//     // Location filters
//     if (state) {
//       filter.state = { $regex: state, $options: "i" };
//     }

//     if (city) {
//       filter.city = { $regex: city, $options: "i" };
//     }

//     if (district) {
//       filter.district = { $regex: district, $options: "i" };
//     }

//     // Business filters
//     if (investmentRange) {
//       filter.investmentRange = investmentRange;
//     }

//     if (category) {
//       filter.category = { $regex: category, $options: "i" };
//     }

//     if (industry) {
//       filter.industry = { $regex: industry, $options: "i" };
//     }

//     if (subCategory) {
//       filter.subCategory = { $regex: subCategory, $options: "i" };
//     }

//     if (planToInvest) {
//       filter.planToInvest = planToInvest;
//     }

//     if (readyToInvest) {
//       filter.readyToInvest = readyToInvest;
//     }

//     if (enquiryVia) {
//       filter.enquiryVia = enquiryVia;
//     }

//     // Apply by filter(who applied)
//     if (applyBy) {
//       filter["apply.applyBy"] = applyBy;
//     }

//     // Date range filters
//     if (startDate || endDate) {
//       filter.createdAt = {};
//       if (startDate) {
//         filter.createdAt.$gte = new Date(startDate);
//       }
//       if (endDate) {
//         // Add one day to include the entire end date
//         const endDateTime = new Date(endDate);
//         endDateTime.setHours(23, 59, 59, 999);
//         filter.createdAt.$lte = endDateTime;
//       }
//     }

//     // console.log("Applied filter:", JSON.stringify(filter, null, 2));

//     // Pagination
//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     // Sorting
//     const sort = {};
//     sort[sortBy] = sortOrder === "desc" ? -1 : 1;

//     // Total count with filters applied
//     const totalCount = await Model.countDocuments(filter);

//     // Fetch paginated leads with filters
//     const leadsData = await Model.find(filter)
//       .sort(sort)
//       .skip(skip)
//       .limit(parseInt(limit))
//       .lean();

//     // Pagination info
//     const totalPages = Math.ceil(totalCount / parseInt(limit));
//     const paginationInfo = {
//       currentPage: parseInt(page),
//       totalPages,
//       totalCount,
//       hasNextPage: parseInt(page) < totalPages,
//       hasPrevPage: parseInt(page) > 1,
//       limit: parseInt(limit),
//       skip,
//       hasData: leadsData.length > 0,
//       resultsOnCurrentPage: leadsData.length,
//     };

//     // console.log("Pagination info:", paginationInfo);

//     // Handle no data case
//     if (leadsData.length === 0) {
//       const hasFilters = Object.keys(filter).length > 0;

//       return res.json(
//         new ApiResponse(
//           hasFilters ? 200 : 404,
//           {
//             schema,
//             data: [],
//             pagination: paginationInfo,
//             appliedFilters: filter,
//             message: hasFilters
//               ? "No leads found matching the applied filters"
//               : `No data found for schema: ${schema}`,
//           },
//           hasFilters
//             ? `No ${schema} data found with current filters`
//             : `No data found for schema: ${schema}`,
//         ),
//       );
//     }

//     // Successful response
//     res.json(
//       new ApiResponse(
//         200,
//         {
//           schema,
//           data: leadsData,
//           pagination: paginationInfo,
//           appliedFilters: filter,
//           stats: {
//             totalLeads: totalCount,
//             leadsOnPage: leadsData.length,
//             filterCount: Object.keys(filter).length,
//           },
//         },
//         `${schema} data retrieved successfully`,
//       ),
//     );
//   } catch (error) {
//     console.error("Error in getLeadsByIndustryController:", error);
//     return res.status(500).json(
//       new ApiResponse(
//         500,
//         {
//           error: error.message,
//           stack:
//             process.env.NODE_ENV === "development" ? error.stack : undefined,
//         },
//         "Internal server error",
//       ),
//     );
//   }
// };

// // Get leads by brand ID across all industry schemas
// export const getLeadsByBrandIdAllIndustriesController = async (req, res) => {
//   try {
//     const { brandId } = req.params;
//     const {
//       page = 1,
//       limit = 10,
//       sortBy = "createdAt",
//       sortOrder = "desc",
//     } = req.query;

//     // Validate brandId
//     if (!brandId) {
//       return res
//         .status(400)
//         .json(new ApiResponse(400, null, "Brand ID is required"));
//     }

//     // Check if brand exists
//     const brandExists = await BrandDetails.findOne({ uuid: brandId });
//     if (!brandExists) {
//       return res
//         .status(404)
//         .json(new ApiResponse(404, null, "Brand not found"));
//     }

//     // Get all industry models
//     const modelNames = mongoose.modelNames();
//     const industryModels = Object.values(industryMapping).filter((modelName) =>
//       modelNames.includes(modelName),
//     );

//     let allLeads = [];
//     let totalCount = 0;

//     // Search across all industry models
//     for (const modelName of industryModels) {
//       const Model = mongoose.model(modelName);

//       const count = await Model.countDocuments({ brandId });
//       totalCount += count;

//       const leads = await Model.find({ brandId })
//         .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
//         .lean();

//       allLeads = [...allLeads, ...leads];
//     }

//     // Sort all leads
//     allLeads.sort((a, b) => {
//       const aValue = a[sortBy];
//       const bValue = b[sortBy];
//       if (sortOrder === "desc") {
//         return bValue > aValue ? 1 : -1;
//       }
//       return aValue > bValue ? 1 : -1;
//     });

//     // Apply pagination manually
//     const skip = (parseInt(page) - 1) * parseInt(limit);
//     const paginatedLeads = allLeads.slice(skip, skip + parseInt(limit));

//     const totalPages = Math.ceil(totalCount / parseInt(limit));
//     const paginationInfo = {
//       currentPage: parseInt(page),
//       totalPages,
//       totalCount,
//       hasNextPage: parseInt(page) < totalPages,
//       hasPrevPage: parseInt(page) > 1,
//       limit: parseInt(limit),
//     };

//     res.json(
//       new ApiResponse(
//         200,
//         {
//           brandId,
//           data: paginatedLeads,
//           pagination: paginationInfo,
//           totalIndustries: industryModels.length,
//         },
//         "Leads retrieved successfully",
//       ),
//     );
//   } catch (error) {
//     console.error("Error in getLeadsByBrandIdAllIndustriesController:", error);
//     return res
//       .status(500)
//       .json(new ApiResponse(500, {}, "Internal server error"));
//   }
// };

// export const findLeadByApplyIdController = async (req, res) => {
//   try {
//     const { schemas, applyId } = req.query;

//     if (!schemas || !applyId) {
//       return res
//         .status(400)
//         .json(
//           new ApiResponse(
//             400,
//             null,
//             "Missing required parameters: schemas or applyId",
//           ),
//         );
//     }

//     // Convert comma-separated schema names to array
//     const schemaList = schemas.split(",").map((s) => s.trim());
//     const modelNames = mongoose.modelNames();

//     // Filter only valid models
//     const validSchemas = schemaList.filter((schema) =>
//       modelNames.includes(schema),
//     );

//     if (validSchemas.length === 0) {
//       return res
//         .status(400)
//         .json(
//           new ApiResponse(
//             400,
//             { availableSchemas: modelNames },
//             "No valid schemas found in the provided list.",
//           ),
//         );
//     }

//     // console.log("Searching applyId:", applyId, "in schemas:", validSchemas);

//     const results = [];

//     // Search all schemas and collect all matching docs
//     for (const schema of validSchemas) {
//       const Model = mongoose.model(schema);

//       // ✅ FIX: Find *all* documents (not just one)
//       const docs = await Model.find({ "apply.applyId": applyId }).lean();

//       if (docs.length > 0) {
//         results.push({
//           schema,
//           count: docs.length,
//           data: docs,
//         });
//       }
//     }

//     // If no results found in any schema
//     if (results.length === 0) {
//       return res.json(
//         new ApiResponse(
//           404,
//           { applyId, searchedSchemas: validSchemas },
//           "No matching leads found for the given applyId in any schema",
//         ),
//       );
//     }

//     // Success response
//     return res.json(
//       new ApiResponse(
//         200,
//         {
//           applyId,
//           totalSchemasMatched: results.length,
//           totalDocuments: results.reduce((sum, r) => sum + r.count, 0),
//           results,
//         },
//         "Leads found successfully",
//       ),
//     );
//   } catch (error) {
//     console.error("Error in findLeadByApplyIdController:", error);
//     return res
//       .status(500)
//       .json(
//         new ApiResponse(500, { error: error.message }, "Internal server error"),
//       );
//   }
// };


import InvestorEnquiry from "../../model/Leads/leadsModels.js";
import { InvsRegister } from "../../model/Investor/invsRegister.js";

export const createInvestorEnquiry = async (req, res) => {
  try {
    const {
      applyId,
      district,
      investmentRange,
      planToInvest,
      readyToInvest,
      brandId,
      brandName,
    } = req.body;

    const investor = await InvsRegister.findOne({
      uuid: applyId,
    });

    if (!investor) {
      return res.status(404).json({
        success: false,
        message: "Investor not found",
      });
    }

    const preference = investor?.preferences?.[0] || {};
    const categoryData = preference?.category?.[0] || {};

    const enquiry = await InvestorEnquiry.create({
      investorId: investor.uuid,

      investorName: investor.firstName,

      investorEmail: investor.email,

      investorPhone: investor.mobileNumber,

      state: investor.state,

      district,

      city: investor.city,

      investmentRange,

      planToInvest,

      readyToInvest,

      brandId,

      brandName,

      industry: categoryData.main || "",

      category: categoryData.sub || "",

      subCategory: categoryData.child || "",
    });

    return res.status(201).json({
      success: true,
      data: enquiry,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllInvestorEnquiries = async (
  req,
  res
) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      industry,
      investmentRange,
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        {
          investorName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          investorEmail: {
            $regex: search,
            $options: "i",
          },
        },
        {
          investorPhone: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (industry) {
      query.industry = industry;
    }

    if (investmentRange) {
      query.investmentRange =
        investmentRange;
    }

    const data =
      await InvestorEnquiry.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

    const total =
      await InvestorEnquiry.countDocuments(
        query
      );

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getInvestorEnquiryById = async (
  req,
  res
) => {
  try {
    const { uuid } = req.params;

    const data =
      await InvestorEnquiry.findOne({
        uuid,
      });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Investor not found",
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const updateInvestorEnquiry =
  async (req, res) => {
    try {
      const { uuid } = req.params;

      const updated =
        await InvestorEnquiry.findOneAndUpdate(
          { uuid },
          req.body,
          {
            new: true,
          }
        );

      if (!updated) {
        return res.status(404).json({
          success: false,
          message:
            "Investor enquiry not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };


  export const deleteInvestorEnquiry =
  async (req, res) => {
    try {
      const { uuid } = req.params;

      const deleted =
        await InvestorEnquiry.findOneAndDelete(
          {
            uuid,
          }
        );

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message:
            "Investor enquiry not found",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Investor enquiry deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

