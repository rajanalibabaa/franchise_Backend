

import InvestorEnquiry from "../../model/Leads/leadsModels.js";
import { InvsRegister } from "../../model/Investor/invsRegister.js";
import  {BrandFranchiseDetails} from "../../model/Brand/Brand.model/FranchiseDetails.model.js";
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
      state,
      
    } = req.body;

    console.log("Received enquiry data:", req.body);
    const investor = await InvsRegister.findOne({
      uuid: applyId,
    });

    const franchiseDetails = await BrandFranchiseDetails.findOne({
      brandOwnerId: brandId,
    });

    const brandCategories =
  franchiseDetails?.franchiseDetails?.brandCategories || {};

const enquiryFranchiseType =
  franchiseDetails?.franchiseDetails?.fico?.[0]?.franchiseModel || "";

console.log(enquiryFranchiseType);

    //   if (!franchiseDetails) {
    //     return res.status(404).json({
    //       success: false,
    //       message: "Franchise details not found for the given brandId",
    //     });
    // }
    // if (!investor) {
    //   return res.status(404).json({
    //     success: false,
    //     message: "Investor not found",
    //   });
    // }

    const preference = investor?.preferences?.[0] || {};
    const categoryData = preference?.category?.[0] || {};

const enquiry = await InvestorEnquiry.create({
  investorId: investor?.uuid || applyId || "",

  investorName:
    investor?.firstName ||
    req.body.fullName ||
    "",

  investorEmail:
    investor?.email ||
    req.body.email ||
    "",

  investorPhone:
    investor?.mobileNumber ||
    req.body.mobileNumber ||
    "",

  state:
    state ||
    req.body.state ||
    "",

  district:
    district ||
    req.body.district ||
    "",

  city:
    investor?.city ||
    req.body.city ||
    "",
investorEnquiryModel:
  enquiryFranchiseType ||
  req.body.investorEnquiryModel ||
  "",

  investmentRange:
    investmentRange ||
    req.body.investmentRange ||
    "",

  planToInvest:
    planToInvest ||
    req.body.planToInvest ||
    "",

  readyToInvest:
    readyToInvest ||
    req.body.readyToInvest ||
    "",

  brandId:
    brandId ||
    "",

  brandName:
    brandName ||

    "",

  industry:
    brandCategories?.main ||
   req.body.categories[0]?.main ||
    "",

  category:
    brandCategories?.sub ||
    req.body.categories[0]?.sub ||
    "",


});

    return res.status(201).json({
      
      success: true,
      data: enquiry,
      
    });
          console.log("response of investor enquiry", enquiry);

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
      limit: Number(limit),
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
    const { applyId } = req.body;

    const data =
      await InvestorEnquiry.find({
        investorId:applyId,
      });
console.log("Query result:", data);
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

export const getSentLeadsByBrandIdEnquires = async (
  req,
  res
) => {
  try {
    const { brandId } = req.body;

    const leads =
      await InvestorEnquiry.find({
        "brandsSent.brandId": brandId,
      }).sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: leads.length,
      data: leads,
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
      const { investorId } = req.params;

      const updated =
        await InvestorEnquiry.findOneAndUpdate(
          { investorId },
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
      const { investorId } = req.params;

      const deleted =
        await InvestorEnquiry.findOneAndDelete(
          {
            investorId,
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


