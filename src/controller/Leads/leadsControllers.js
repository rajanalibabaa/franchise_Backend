import { BrandDetails } from "../../model/Brand/Brand.model/BrandDetails.model.js";
import { format } from "../../utils/AllLeads/instantApplyPaidLeads.js";
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";

const getLeadsBybrandId = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.json(new ApiResponse(200, null, "Id is required"));
    }

    const packageStartDate = req?.query?.packageStartDate;
    const status = req?.query?.status || "true";
    const page = req?.query?.page || 0;
    const limit = req?.query?.limit || 10;
    const leadType = req?.query?.leadType || "paid";
    const filter = req?.query?.filter;
    const dateFilter = req?.query?.dateFilter;
    let date;
    if (status === "true") {
      date = format(new Date(packageStartDate));
    } else {
      date = packageStartDate;
    }

    if (!packageStartDate && leadType !== "free") {
      return res.json(
        new ApiResponse(
          404,
          null,
          "packageStartDate and leadType query params are required",
        ),
      );
    }
    let project = {};

    const aggregationPipline = [
      {
        $match: { uuid: id },
      },
    ];

    if (leadType === "paid") {
      if (filter === "catInv") {
        aggregationPipline.push(
          {
            $lookup: {
              from: "categoryinvestmentrangematches",
              localField: "uuid",
              foreignField: "brandId",
              as: "categoryInvestmentrangeMatch",
            },
          },
          {
            $unwind: {
              path: "$categoryInvestmentrangeMatch",
              preserveNullAndEmptyArrays: true,
            },
          },
        );

        project = {
          _id: 0,
          uuid: 1,

          categoryInvestmentrangeMatch: {
            $first: {
              $filter: {
                input:
                  "$categoryInvestmentrangeMatch.categoryInvestmentrangeMatchRecords",
                as: "d",
                cond: { $eq: ["$$d.packageStartDate", date] },
              },
            },
          },
        };
      } else if (filter === "catLoc") {
        aggregationPipline.push(
          {
            $lookup: {
              from: "categorylocationmatches",
              localField: "uuid",
              foreignField: "brandId",
              as: "categoryLocationMatch",
            },
          },
          {
            $unwind: {
              path: "$categoryLocationMatch",
              preserveNullAndEmptyArrays: true,
            },
          },
        );

        project = {
          _id: 0,
          uuid: 1,
          categoryLocationMatch: {
            $first: {
              $filter: {
                input: "$categoryLocationMatch.categoryLocationMatchRecords",
                as: "d",
                cond: { $eq: ["$$d.packageStartDate", date] },
              },
            },
          },
        };
      } else {
        aggregationPipline.push(
          {
            $lookup: {
              from: "categoryinvestmentrangematches",
              localField: "uuid",
              foreignField: "brandId",
              as: "categoryInvestmentrangeMatch",
            },
          },
          {
            $lookup: {
              from: "categorylocationmatches",
              localField: "uuid",
              foreignField: "brandId",
              as: "categoryLocationMatch",
            },
          },
          {
            $unwind: {
              path: "$categoryLocationMatch",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $unwind: {
              path: "$categoryInvestmentrangeMatch",
              preserveNullAndEmptyArrays: true,
            },
          },
        );

        project = {
          _id: 0,
          uuid: 1,

          categoryInvestmentrangeMatch: {
            $first: {
              $filter: {
                input:
                  "$categoryInvestmentrangeMatch.categoryInvestmentrangeMatchRecords",
                as: "d",
                cond: { $eq: ["$$d.packageStartDate", date] },
              },
            },
          },

          categoryLocationMatch: {
            $first: {
              $filter: {
                input: "$categoryLocationMatch.categoryLocationMatchRecords",
                as: "d",
                cond: { $eq: ["$$d.packageStartDate", date] },
              },
            },
          },
        };
      }
    } else {
      aggregationPipline.push(
        {
          $lookup: {
            from: "brandemailcounts",
            localField: "uuid",
            foreignField: "brandId",
            as: "freeLeads",
          },
        },

        {
          $unwind: {
            path: "$freeLeads",
            preserveNullAndEmptyArrays: true,
          },
        },
      );
      project = {
        _id: 0,
        uuid: 1,
        freeLeads: {
          leadCount: { $ifNull: ["$freeLeads.freeEmailCount", 0] },
          records: "$freeLeads.freeEmailRecords",
        },
      };
    }

    aggregationPipline.push({ $project: project });

    const result = await BrandDetails.aggregate(aggregationPipline);

    let leads = [];

    if (leadType === "paid") {
      const catLoc = result[0]?.categoryLocationMatch?.records;
      if (catLoc?.length > 0) {
        for (let i = catLoc.length - 1; i >= 0; i--) {
          const element = catLoc[i];
          let data = element?.leadsRecords;

          for (let j = data.length - 1; j >= 0; j--) {
            const record = data[j];
            leads.push({
              ...record,
              matchType: "Category Location",
            });
          }
        }
      }
      const catInv = result[0]?.categoryInvestmentrangeMatch?.records;
      if (catInv?.length > 0) {
        for (let i = catInv.length - 1; i >= 0; i--) {
          const element = catInv[i];
          let data = element?.leadsRecords;

          for (let j = data.length - 1; j >= 0; j--) {
            const record = data[j];
            leads.push({
              ...record,
              matchType: "Category Investmentrange",
            });
          }
        }
      }

      leads.sort((a, b) => new Date(b?.sentAt) - new Date(a?.sentAt));
    } else {
      const free = result[0]?.freeLeads?.records;
      if (free?.length > 0) {
        for (let i = free.length - 1; i >= 0; i--) {
          const element = free[i];
          let data = element?.records;

          for (let j = data.length - 1; j >= 0; j--) {
            const record = data[j];
            leads.push({
              ...record,
              matchType: "free",
            });
          }
        }
      }
    }

    if (dateFilter) {
      const today = new Date();
      const from = new Date();

      from.setDate(today.getDate() - Number(dateFilter));
      const to = today;

      // console.log("from:", from.toISOString());
      // console.log("to:", to.toISOString());
      // console.log("dateFilter:", dateFilter);

      const filteredLeads = leads.filter((item) => {
        const sentAt = new Date(item.sentAt);
        return sentAt >= from && sentAt <= to;
      });

      leads = filteredLeads;
    }

    const total = leads?.length;
    leads = leads?.slice(page * limit, page * limit + limit);

    const pagination = {
      totalRecords: total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      pageSize: parseInt(limit),
    };

    return res.json(
      new ApiResponse(200, { leads, pagination }, "data fetch successfully"),
    );
  } catch (error) {
    return res.json(new ApiResponse(500, "Server error", error.message));
  }
};

export { getLeadsBybrandId };
