import mongoose from "mongoose";
import InstantApplyInvestor from '../../model/NewIncomeInvestor/InstantApplyLocationSchema.js';
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";

export const getInstantApplyInvestorsController = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 100,
      investorEmail,
      investorName,
      investorPhone,
      state,
      city,
      district,
      investmentRange,
      planToInvest,
      readyToInvest,
      applyBy,
      category,
      mainCategory,
      subCategory,
      childCategory,
      sortBy = "createdAt",
      sortOrder = "desc",
      // Date range filters
      startDate,
      endDate,
      // Global search parameter
      search
    } = req.query;

    console.log("Received query params:", req.query);

    // Build filter object dynamically
    const filter = {};
    
    // Global search across multiple fields
    if (search) {
      filter.$or = [
        { investorName: { $regex: search, $options: "i" } },
        { investorEmail: { $regex: search, $options: "i" } },
        { investorPhone: { $regex: search, $options: "i" } },
        { "location.state": { $regex: search, $options: "i" } },
        { "location.city": { $regex: search, $options: "i" } },
        { "location.district": { $regex: search, $options: "i" } },
        { "brandsSent.brandName": { $regex: search, $options: "i" } }
      ];
    } else {
      // Individual field searches (only if global search is not used)
      if (investorEmail) {
        filter.investorEmail = { $regex: investorEmail, $options: "i" };
      }
      
      if (investorName) {
        filter.investorName = { $regex: investorName, $options: "i" };
      }
      
      if (investorPhone) {
        filter.investorPhone = { $regex: investorPhone, $options: "i" };
      }
    }
    
    // Location filters (nested fields)
    if (state) {
      filter["location.state"] = { $regex: state, $options: "i" };
    }
    
    if (city) {
      filter["location.city"] = { $regex: city, $options: "i" };
    }
    
    if (district) {
      filter["location.district"] = { $regex: district, $options: "i" };
    }
    
    // Investment and business filters
    if (investmentRange) {
      filter.investmentRange = { $regex: investmentRange, $options: "i" };
    }
    
    if (planToInvest) {
      filter.planToInvest = { $regex: planToInvest, $options: "i" };
    }
    
    if (readyToInvest) {
      filter.readyToInvest = { $regex: readyToInvest, $options: "i" };
    }
    
    // Apply by filter (nested field)
    if (applyBy) {
      filter["apply.applyBy"] = applyBy;
    }
    
    // Category filters (array field) - Enhanced for better filtering
    if (category || mainCategory || subCategory || childCategory) {
      const categoryFilters = [];
      
      if (mainCategory) {
        categoryFilters.push({ "category.main": { $regex: mainCategory, $options: "i" } });
      }
      if (subCategory) {
        categoryFilters.push({ "category.sub": { $regex: subCategory, $options: "i" } });
      }
      if (childCategory) {
        categoryFilters.push({ "category.child": { $regex: childCategory, $options: "i" } });
      }
      if (category && !mainCategory && !subCategory && !childCategory) {
        categoryFilters.push(
          { "category.main": { $regex: category, $options: "i" } },
          { "category.sub": { $regex: category, $options: "i" } },
          { "category.child": { $regex: category, $options: "i" } }
        );
      }
      
      if (categoryFilters.length > 0) {
        if (mainCategory || subCategory || childCategory) {
          filter.$and = categoryFilters; // All category filters must match
        } else {
          filter.$or = categoryFilters; // Any category field can match
        }
      }
    }
    
    // Date range filters
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDateTime;
      }
    }

    console.log("Applied filter:", JSON.stringify(filter, null, 2));

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Total count with filters applied
    const totalCount = await InstantApplyInvestor.countDocuments(filter);

    // Fetch paginated investors with filters
    const investorsData = await InstantApplyInvestor.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Pagination info
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    const paginationInfo = {
      currentPage: parseInt(page),
      totalPages,
      totalCount,
      hasNextPage: parseInt(page) < totalPages,
      hasPrevPage: parseInt(page) > 1,
      limit: parseInt(limit),
      skip,
      hasData: investorsData.length > 0,
      resultsOnCurrentPage: investorsData.length
    };

    console.log("Pagination info:", paginationInfo);

    // Handle no data case
    if (investorsData.length === 0) {
      const hasFilters = Object.keys(filter).length > 0;
      
      return res.json(
        new ApiResponse(
          hasFilters ? 200 : 404,
          {
            data: [],
            pagination: paginationInfo,
            appliedFilters: filter,
            message: hasFilters 
              ? "No investors found matching the applied filters" 
              : "No investor data found"
          },
          hasFilters 
            ? "No investors found with current filters"
            : "No investor data found"
        )
      );
    }

    // Process data to include additional statistics
    const processedData = investorsData.map(investor => ({
      ...investor,
      totalBrandsSent: investor.brandsSent ? investor.brandsSent.length : 0,
      emailsSent: investor.brandsSent ? investor.brandsSent.filter(b => b.emailSent).length : 0,
      categoryString: investor.category && investor.category.length > 0 
        ? `${investor.category[0].main} > ${investor.category[0].sub} > ${investor.category[0].child}`
        : 'No category',
      locationString: `${investor.location?.city || ''}, ${investor.location?.district || ''}, ${investor.location?.state || ''}`.replace(/^,\s*|,\s*$/g, '').replace(/,\s*,/g, ',')
    }));

    // Extract unique values for filters
    const uniqueStates = [...new Set(investorsData.map(inv => inv.location?.state).filter(Boolean))];
    const uniqueCities = [...new Set(investorsData.map(inv => inv.location?.city).filter(Boolean))];
    const uniqueDistricts = [...new Set(investorsData.map(inv => inv.location?.district).filter(Boolean))];
    const uniqueInvestmentRanges = [...new Set(investorsData.map(inv => inv.investmentRange).filter(Boolean))];
    const uniquePlanToInvest = [...new Set(investorsData.map(inv => inv.planToInvest).filter(Boolean))];
    const uniqueReadyToInvest = [...new Set(investorsData.map(inv => inv.readyToInvest).filter(Boolean))];
    const uniqueMainCategories = [...new Set(investorsData.flatMap(inv => inv.category?.map(cat => cat.main) || []).filter(Boolean))];
    const uniqueSubCategories = [...new Set(investorsData.flatMap(inv => inv.category?.map(cat => cat.sub) || []).filter(Boolean))];
    const uniqueChildCategories = [...new Set(investorsData.flatMap(inv => inv.category?.map(cat => cat.child) || []).filter(Boolean))];

    // Successful response
    res.json(
      new ApiResponse(
        200,
        {
          data: processedData,
          pagination: paginationInfo,
          appliedFilters: filter,
          filterOptions: {
            states: uniqueStates.sort(),
            cities: uniqueCities.sort(),
            districts: uniqueDistricts.sort(),
            investmentRanges: uniqueInvestmentRanges.sort(),
            planToInvestOptions: uniquePlanToInvest.sort(),
            readyToInvestOptions: uniqueReadyToInvest.sort(),
            mainCategories: uniqueMainCategories.sort(),
            subCategories: uniqueSubCategories.sort(),
            childCategories: uniqueChildCategories.sort(),
            applyByOptions: ["Investor", "Brand", "other"]
          },
          stats: {
            totalInvestors: totalCount,
            investorsOnPage: investorsData.length,
            filterCount: Object.keys(filter).length,
            totalBrandsSent: investorsData.reduce((sum, inv) => sum + (inv.brandsSent?.length || 0), 0),
            averageBrandsPerInvestor: totalCount > 0 ? 
              (investorsData.reduce((sum, inv) => sum + (inv.brandsSent?.length || 0), 0) / totalCount).toFixed(2) : 0
          }
        },
        "Investors data retrieved successfully"
      )
    );

  } catch (error) {
    console.error("Error in getInstantApplyInvestorsController:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, {
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }, "Internal server error"));
  }
};