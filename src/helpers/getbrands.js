// helpers/getbrands.js

import { BrandDetails } from "../model/Brand/Brand.model/BrandDetails.model.js";

export const getBrandsHelperfuntion = async (
  match = {},
  project = {},
  limit = 0,
  skip = 0,
  brandfranchisedetails = false,
  branduploads = false,
  brandexpansionlocationdatas = false
) => {
  try {
    const pipeline = [];

    // ── STEP 1: Filter ─────────────────────────────────────
    pipeline.push({
      $match: {
        "brandDetails.isBrandPause": { $ne: true },
        "brandDetails.isApproved":   { $ne: false },
        ...match,
      },
    });

    // ── STEP 2: Project EARLY — smaller docs before lookups
    const effectiveProject =
      project && Object.keys(project).length > 0
        ? project
        : {
            uuid:                          1,
            "brandDetails.brandName":      1,
            "brandDetails.isBrandPause":   1,
            "brandDetails.isApproved":     1,
            _id:                           1,
          };

    pipeline.push({ $project: effectiveProject });

    // ── STEP 3: Pagination
    if (skip  > 0) pipeline.push({ $skip:  skip  });
    if (limit > 0) pipeline.push({ $limit: limit });

    // ── STEP 4: Franchise lookup
    if (brandfranchisedetails) {
      pipeline.push(
        {
          $lookup: {
            from: "brandfranchisedetails",
            let:  { brandId: "$uuid" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$brandOwnerId", "$$brandId"] },
                },
              },
              {
                $project: {
                  "franchiseDetails.brandCategories.main": 1,
                  _id: 0,
                },
              },
            ],
            as: "franchiseDetails",
          },
        },
        {
          $unwind: {
            path: "$franchiseDetails",
            preserveNullAndEmptyArrays: true,
          },
        }
      );
    }

    // ── STEP 5: Upload lookup
    if (branduploads) {
      pipeline.push(
        {
          $lookup: {
            from: "branduploads",
            let:  { brandId: "$uuid" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$brandOwnerId", "$$brandId"] },
                },
              },
              {
                $project: {
                  "uploads.brandLogo": 1,
                  brandLogo:           1,
                  _id:                 0,
                },
              },
            ],
            as: "uploads",
          },
        },
        {
          $unwind: {
            path: "$uploads",
            preserveNullAndEmptyArrays: true,
          },
        }
      );
    }

    // ── STEP 6: Expansion lookup
    if (brandexpansionlocationdatas) {
      pipeline.push(
        {
          $lookup: {
            from: "brandexpansionlocationdatas",
            let:  { brandId: "$uuid" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$brandOwnerId", "$$brandId"] },
                },
              },
            ],
            as: "brandexpansionlocationdata",
          },
        },
        {
          $unwind: {
            path: "$brandexpansionlocationdata",
            preserveNullAndEmptyArrays: true,
          },
        }
      );
    }

    return await BrandDetails.aggregate(pipeline).allowDiskUse(true);
  } catch (error) {
    console.error("❌ Error fetching brands:", error);
    throw error;
  }
};


// ─────────────────────────────────────────────────────────
// ✅ NEW FUNCTION — search brands BY NAME inside MongoDB
// Searches ALL brands — no 200 limit problem
// Returns only matched + projected results
// ─────────────────────────────────────────────────────────

export const searchBrandsByName = async (searchTerm, industry = "", limit = 10) => {
  try {
    const pipeline = [];

    // ── STEP 1: Text search on brandName ──────────────────
    // Supports: exact, startsWith, contains — all inside MongoDB
    pipeline.push({
      $match: {
        "brandDetails.isBrandPause": { $ne: true },
        "brandDetails.isApproved":   { $ne: false },

        // ✅ Regex search — searches ALL documents
        "brandDetails.brandName": {
          $regex:   searchTerm,
          $options: "i", // case-insensitive
        },

        // ✅ Industry filter (optional)
        ...(industry.length > 0
          ? { "franchiseDetails.franchiseDetails.brandCategories.main": industry }
          : {}),
      },
    });

    // ── STEP 2: Project only needed fields ─────────────────
    pipeline.push({
      $project: {
        uuid:                     1,
        "brandDetails.brandName": 1,
        _id:                      1,
      },
    });

    // ── STEP 3: Limit results ──────────────────────────────
    pipeline.push({ $limit: limit });

    // ── STEP 4: Lookup logo only for matched brands ────────
    pipeline.push(
      {
        $lookup: {
          from: "branduploads",
          let:  { brandId: "$uuid" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$brandOwnerId", "$$brandId"] },
              },
            },
            {
              $project: {
                "uploads.brandLogo": 1,
                _id:                 0,
              },
            },
            { $limit: 1 }, // ✅ Only 1 upload doc per brand needed
          ],
          as: "uploads",
        },
      },
      {
        $unwind: {
          path: "$uploads",
          preserveNullAndEmptyArrays: true,
        },
      }
    );

    const brands = await BrandDetails.aggregate(pipeline).allowDiskUse(true);
    return brands;
  } catch (error) {
    console.error("❌ searchBrandsByName error:", error);
    return [];
  }
};