import { IndustryManagement } from "../../model/Admin/CMS/industryManagement.model.js";
import { BrandDetails } from "../../model/Brand/Brand.model/BrandDetails.model.js";
import { BrandExpansionLocationData } from "../../model/Brand/Brand.model/ExpansionLocation.model.js";
import { BrandFranchiseDetails } from "../../model/Brand/Brand.model/FranchiseDetails.model.js";
import { BrandUploads } from "../../model/Brand/Brand.model/Uploads.model.js";
import { FavoriteBrandsLikedByInvestor } from "../../model/Investor/favoriteBrandsInvestor.js";
import { InvsRegister } from "../../model/Investor/invsRegister.js";
import ShortListed from "../../model/ShortList/shortListedModel.js";
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";
import { shuffleArray } from "../../utils/HelperFunction/shuffle.js";
import ExcelJS from 'exceljs';

// export const datafieldnewEntry = async (req, res) => {
//   try {
//     const brands = await BrandDetails.find({}, "_id brandDetails.isBrandPause")
  
//     const defaultPackage = {
//       packageType: "silver",
//       totalAmount: 999,
//       totalMonths: 3,
//       perMonthLead: 15,
//       totalLeads: 45,
//       isActive: true,
//       packageUpdatedTime: new Date(),
//     };

//     if (!brands.length) {
//       return res.status(404).json(new ApiResponse(404, [], "No brand records found"));
//     }

//     const updatedBrands = await Promise.all(
//       brands.map(async (brand, index) => {
//         try {
//           const updated = await BrandDetails.findByIdAndUpdate(
//             brand._id,
//             { $set: { "brandDetails.paymentPackage": defaultPackage } },
//             { new: true }
//           );

//           console.log(` Updated brand #${index + 1}:`, updated._id);
//           return updated;
//         } catch (innerErr) {
//           console.error(` Error updating brand at index ${index}:`, innerErr.message);
//           return null;
//         }
//       })
//     );

//     const successfulUpdates = updatedBrands.filter(Boolean);

//     return res.json(
//       new ApiResponse(200, successfulUpdates, "Re-entry process completed successfully")
//     );

//   } catch (outerError) {
//     console.error(" Outer error:", outerError);
//     return res.status(500).json({ message: "Server error", error: outerError.message });
//   }
// };





// export const datafieldnewEntry = async (req, res) => {
//   try {
    
//     const brands = await BrandFranchiseDetails.find({"franchiseDetails.brandCategories.child":"Juice & Smoothie Bars"})

//     if (!brands.length) {
//       return res
//         .status(404)
//         .json(new ApiResponse(404, [], "No brand records found"));
//     }

//     console.log(`🟢 Found ${brands.length} brands to update.`);

   
  
//     // const updatedBrands = await Promise.all(
//     //   brands.map(async (brand, index) => {
//     //     try {
//     //       const updated = await BrandFranchiseDetails.findByIdAndUpdate(
//     //         brand._id,
//     //         {
//     //           $set: {"franchiseDetails.brandCategories.sub":"Quick Service Restaurants (QSR)"},
//     //         },
//     //         { new: true }
//     //       );

//     //       console.log(`✅ Updated brand #${index + 1}:`, updated?._id);
//     //       return updated;
//     //     } catch (innerErr) {
//     //       console.error(
//     //         `❌ Error updating brand at index ${index}:`,
//     //         innerErr.message
//     //       );
//     //       return null;
//     //     }
//     //   })
//     // );

  
//     // const successfulUpdates = updatedBrands.filter(Boolean);

  
//     return res.json(
//       new ApiResponse(
//         200,
//         brands
//         // successfulUpdates,
//         // `Re-entry process completed successfully. Updated ${successfulUpdates.length} brands.`
//       )
//     );
//   } catch (outerError) {
//     console.error("🚨 Outer error:", outerError);
//     return res
//       .status(500)
//       .json(
//         new ApiResponse(500, null, `Server error: ${outerError.message}`)
//       );
//   }
// };


// export const datafieldnewEntry = async (req, res) => {
//   try {
//     // Get first 65 brands
//     const data = await BrandDetails.find({}).limit(65);

//     if (data.length === 0) {
//       return res
//         .status(404)
//         .json(new ApiResponse(404, [], "No brand records found"));
//     }

//     let matched = 0;
//     let modified = 0;

//     // Update each document one-by-one
//     for (let i = 0; i < data.length; i++) {
//       const element = data[i];

//       const result = await BrandDetails.findByIdAndUpdate(
//         element._id, // FIXED
//         { 
//           $set: { 
//             "brandDetails.isBrandPause": false 
//           } 
//         },
//         { new: true } // optional but safe
//       );

//       if (result) {
//         matched++;
//         modified++; // assumes update always modifies (or check old value if needed)
//       }
//     }

//     return res.json(
//       new ApiResponse(
//         200,
//         { matched, modified },
//         `Re-entry completed. Updated ${modified} brands.`
//       )
//     );

//   } catch (error) {
//     console.error("🚨 Server error:", error);
//     return res
//       .status(500)
//       .json(new ApiResponse(500, null, `Server error: ${error.message}`));
//   }
// };


export const likeandshortlist = async(id) => {

  let likedBrands = [];
  let shortListedBrands = [];
  if (id) {
      const investor = await InvsRegister.findOne({ uuid: id });

      if (investor) {
       
        const investorFavorites = await FavoriteBrandsLikedByInvestor.findOne({
          InvestorUserId: investor._id
        });
        likedBrands = investorFavorites?.favoriteBrandByInvestor.map(b => b.brandID.toString()) || [];

       
        const investorShortList = await ShortListed.find({
          "ShortListedBy.investor.userId": investor._id
        });
        shortListedBrands = investorShortList.map(s => s.brandOwnerId.toString());

        

      } else {
        
        const brand = await BrandDetails.findOne({ uuid: id });
console.log("brand :",brand)
        if (brand) {
          
          const brandFavorites = await FavoriteBrandsLikedBybrand.findOne({
            brandUserId: brand._id
          });
           console.log("brandFavorites id :",brandFavorites)
          likedBrands = brandFavorites?.favoriteBrandBybrand.map  (b => b.brandID.toString()) || [];

         
          const brandShortList = await ShortListed.find({
            "ShortListedBy.brand.userId": brand._id
          });
          shortListedBrands = brandShortList.map(s => s.brandOwnerId.toString());
        }
      }
    }

    // console.log("shortListedBrands :",shortListedBrands)

    return {likedBrands,shortListedBrands}
}
 
export const testgetAllBrands = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const id = req.query.id || null;

    const { likedBrands, shortListedBrands } = await likeandshortlist(id);

    const aggregationPipeline = [
      {
        $match: {
          "brandDetails.isBrandPause": { $ne: true } 
        }
      },
      {
        $lookup: {
          from: "brandfranchisedetails",
          localField: "uuid",
          foreignField: "brandOwnerId",
          as: "franchiseDetails"
        }
      },
      {
        $lookup: {
          from: "branduploads",
          localField: "uuid",
          foreignField: "brandOwnerId",
          as: "uploads"
        }
      },
      { $unwind: { path: "$franchiseDetails", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$uploads", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          isLiked: {
            $in: ["$_id", likedBrands.map(id => new mongoose.Types.ObjectId(id))]
          },
          isShortListed: {
            $in: ["$_id", shortListedBrands.map(id => new mongoose.Types.ObjectId(id))]
          }
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          _id: 0,
          brandID: 1,
          uuid: 1,
          isLiked: 1,
          isShortListed: 1,
          brandname: "$brandDetails.brandName",
          slug: "$brandDetails.slug",
          brandCategories: {
            $ifNull: ["$franchiseDetails.franchiseDetails.brandCategories", null]
          },
          fico: {
            $let: {
              vars: {
                data: { $arrayElemAt: ["$franchiseDetails.franchiseDetails.fico", 0] }
              },
              in: {
                investmentRange: "$$data.investmentRange",
                areaRequired: "$$data.areaRequired",
                franchiseModel: "$$data.franchiseModel"
              }
            }
          },
          logo: {
            $cond: {
              if: { $isArray: "$uploads.uploads.brandLogo" },
              then: { $arrayElemAt: ["$uploads.uploads.brandLogo", 0] },
              else: null
            }
          },
          franchiseVideos: {
            $cond: {
              if: { $isArray: "$uploads.uploads.franchisePromotionVideo" },
              then: { $arrayElemAt: ["$uploads.uploads.franchisePromotionVideo", 0] },
              else: null
            }
          }
        }
      },
      { $skip: skip },
      { $limit: limit }
    ];

    const [brandsData, totalCountResult] = await Promise.all([
      BrandDetails.aggregate(aggregationPipeline),
      BrandDetails.aggregate([
        {
          $match: { "brandDetails.isBrandPause": { $ne: true } } 
        },
        {
          $count: "totalCount"
        }
      ])
    ]);

    const totalCount = totalCountResult[0]?.totalCount || 0;

    if (!brandsData || brandsData.length === 0) {
      return res.json(new ApiResponse(404, null, "No active brands found"));
    }

    const brands = shuffleArray(brandsData);
    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    return res.json(
      new ApiResponse(
        200,
        {
          brands,
          pagination: {
            total: totalCount,
            totalPages,
            currentPage: page,
            limit,
            hasNext,
            hasPrevious
          }
        },
        "Brand data fetched successfully"
      )
    );
  } catch (error) {
    console.error("Error fetching brands:", error);
    return res.json(
      new ApiResponse(500, null, `Failed to fetch brands: ${error.message}`)
    );
  }
};

// export const datafieldnewEntry = async (req, res) => {
//   try {

//     const data = await BrandDetails.find();
//     const franchisedata = await BrandUploads.find();

//     // all brand uuids
//     const q_id = data.map(i => String(i.uuid).trim());

//     // all franchise owner ids
//     const matchedFranchiseData = franchisedata.map(i =>
//       String(i.brandOwnerId).trim()
//     );

//     // convert to Set for fast lookup
//     const qidSet = new Set(q_id);

//     // ❌ NOT MATCHED IDs
//     const notMatched = matchedFranchiseData.filter(
//       id => !qidSet.has(id)
//     );

//     console.log("Not matched IDs:", notMatched);

//     return res.json({
//       totalBrandUUID: q_id.length,
//       totalFranchise: matchedFranchiseData.length,
//       notMatchedCount: notMatched.length,
//       notMatched
//     });

//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Server Error" });
//   }
// };

// export const datafieldnewEntry = async (req, res) => {
//   try {

//     // Get all valid brand UUIDs
//     const data = await BrandDetails.find().select("uuid");

//     const q_id = data.map(i => String(i.uuid).trim());

//     // ✅ Find FIRST unmatched record
//     const unmatched = await BrandFranchiseDetails.find({
//       brandOwnerId: { $nin: q_id }
//     })
//     .limit(5);   // 👈 limit here

//     // Get IDs to delete
//     const idsToDelete = unmatched.map(i => i.brandOwnerId);

//     // Delete only that record
//     const deleteResult = await BrandFranchiseDetails.deleteMany({
//       brandOwnerId: { $in: idsToDelete }
//     });

//     return res.json({
//       deletedCount: deleteResult.deletedCount,
//       deletedIds: idsToDelete
//     });

//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Server Error" });
//   }
// };

// export const datafieldnewEntry = async (req, res) => {
//   try {

//     const data = await BrandDetails.find();

//     // create brand array
//     const brand = data.map(i => 
//       i.brandDetails.brandName,
     
//     );

//     brand.sort()

//     return res.json(brand);

//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Server Error" });
//   }
// };


// export const datafieldnewEntry = async (req, res) => {
//   try {

//     const aggregationPipeline = [

//       // 🔹 Join Franchise Details
//       {
//         $lookup: {
//           from: "brandfranchisedetails",
//           localField: "uuid",
//           foreignField: "brandOwnerId", // ✅ FIXED (removed space)
//           as: "franchiseDetails",
//         },
//       },

//       // 🔹 Unwind franchise details
//       {
//         $unwind: {
//           path: "$franchiseDetails",
//           preserveNullAndEmptyArrays: true,
//         },
//       },

//       // 🔹 Select required fields
//       {
//         $project: {
//           _id: 0,
//           brandname: "$brandDetails.brandName",
//           mainCategory:
//             "$franchiseDetails.franchiseDetails.brandCategories.main",
//           subCategory:
//             "$franchiseDetails.franchiseDetails.brandCategories.sub",
//         },
//       },

//       // ✅ GROUP 1 → main + sub category
//       {
//         $group: {
//           _id: {
//             mainCategory: "$mainCategory",
//             subCategory: "$subCategory",
//           },
//           brands: {
//             $addToSet: "$brandname", // remove duplicates
//           },
//         },
//       },

//       // ✅ ADD brand count per subCategory
//       {
//         $project: {
//           _id: 1,
//           brands: 1,
//           brandCount: { $size: "$brands" },
//         },
//       },

//       // ✅ GROUP 2 → main category
//       {
//         $group: {
//           _id: "$_id.mainCategory",
//           subCategories: {
//             $push: {
//               subCategory: "$_id.subCategory",
//               brands: "$brands",
//               brandCount: "$brandCount", // ✅ subcategory count
//             },
//           },
//           totalBrands: {
//             $sum: "$brandCount", // ✅ main category total
//           },
//         },
//       },

//       // ✅ Final Output Shape (STRUCTURE SAME)
//       {
//         $project: {
//           _id: 0,
//           mainCategory: "$_id",
//           subCategories: 1,
//           totalBrands: 1,
//         },
//       },

//       // ✅ Sort categories
//       {
//         $sort: { mainCategory: 1 },
//       },
//     ];

//     // Execute aggregation
//     const result = await BrandDetails.aggregate(aggregationPipeline);

//     return res.status(200).json(
//       new ApiResponse(
//         200,
//         result,
//         "Category structured data fetched successfully"
//       )
//     );

//   } catch (error) {
//     console.error("Error fetching brands:", error);

//     return res.status(500).json(
//       new ApiResponse(
//         500,
//         null,
//         `Failed to fetch brands: ${error.message}`
//       )
//     );
//   }
// };




// import { ObjectId } from 'mongodb';

// export const datafieldnewEntry = async (req, res) => {
//   try {
//     /* ===============================
//        FETCH ALL BRANDS DATA
//     =============================== */
//     const aggregationPipeline = [
//       {
//         $lookup: {
//           from: "brandfranchisedetails",
//           localField: "uuid",
//           foreignField: "brandOwnerId",
//           as: "brandfranchisedetails",
//         },
//       },
//       {
//         $unwind: {
//           path: "$brandfranchisedetails",
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       {
//         $lookup: {
//           from: "branduploads",
//           localField: "uuid",
//           foreignField: "brandOwnerId",
//           as: "uploads",
//         },
//       },
//       {
//         $lookup: {
//           from: "brandexpansionlocationdatas",
//           localField: "uuid",
//           foreignField: "brandOwnerId",
//           as: "brandexpansionlocationdatas",
//         },
//       },
//       {
//         $lookup: {
//           from: "viewedtobrands",
//           localField: "_id",
//           foreignField: "brandUserID",
//           as: "totalViewData",
//         },
//       },
//       {
//         $addFields: {
//           totalInvestorViews: {
//             $size: {
//               $ifNull: [
//                 { $arrayElemAt: ["$totalViewData.viewedByInvestors", 0] },
//                 [],
//               ],
//             },
//           },
//           totalBrandViews: {
//             $size: {
//               $ifNull: [
//                 { $arrayElemAt: ["$totalViewData.viewedByBrands", 0] },
//                 [],
//               ],
//             },
//           },
//         },
//       },
//       {
//         $lookup: {
//           from: "shortlisteds",
//           localField: "_id",
//           foreignField: "brandOwnerId",
//           as: "shortlisteds",
//         },
//       },
//       {
//         $addFields: {
//           totalSortlistCount: {
//             $size: { $ifNull: ["$shortlisteds", []] },
//           },
//         },
//       },
//       {
//         $lookup: {
//           from: "favoritebrands",
//           localField: "_id",
//           foreignField: "brandOwnerId",
//           as: "favoritebrands",
//         },
//       },
//       {
//         $addFields: {
//           totalLikedCount: {
//             $sum: {
//               $map: {
//                 input: "$favoritebrands",
//                 as: "fav",
//                 in: {
//                   $size: { $ifNull: ["$$fav.favoriteBy", []] },
//                 },
//               },
//             },
//           },
//         },
//       },
//       {
//         $addFields: {
//           franchiseDetails: "$brandfranchisedetails.franchiseDetails",
//           totalViewCount: {
//             $add: ["$totalInvestorViews", "$totalBrandViews"],
//           },
//         },
//       },
//     ];

//     const brands = await BrandDetails.aggregate(aggregationPipeline);

//     /* ===============================
//        CREATE EXCEL WORKBOOK
//     =============================== */
//     const workbook = new ExcelJS.Workbook();
//     workbook.creator = 'Franchise System';
//     workbook.created = new Date();

//     // ============ SHEET 1: MAIN BRAND DETAILS ============
//     const mainSheet = workbook.addWorksheet('Main Brand Details', {
//       properties: { tabColor: { argb: 'FF2C3E50' } },
//       views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
//     });

//     // Collect all unique headers with proper names
//     const allMainFields = new Set();
//     const mainRows = [];

//     brands.forEach((brand) => {
//       const flatBrand = flattenObjectWithProperNames(brand, '');
//       mainRows.push(flatBrand);
//       Object.keys(flatBrand).forEach(key => allMainFields.add(key));
//     });

//     // Convert Set to Array and sort
//     const mainColumns = Array.from(allMainFields).sort();
    
//     // Set worksheet columns
//     mainSheet.columns = mainColumns.map(field => ({
//       header: field,
//       key: field,
//       width: Math.min(50, Math.max(15, field.length + 5))
//     }));

//     // Style header
//     mainSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
//     mainSheet.getRow(1).fill = {
//       type: 'pattern',
//       pattern: 'solid',
//       fgColor: { argb: 'FF2C3E50' }
//     };
//     mainSheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

//     // Add data rows
//     mainRows.forEach(rowData => {
//       const row = mainSheet.addRow(rowData);
//       row.eachCell({ includeEmpty: true }, (cell) => {
//         cell.border = {
//           top: { style: 'thin' },
//           left: { style: 'thin' },
//           bottom: { style: 'thin' },
//           right: { style: 'thin' }
//         };
//         if (typeof cell.value === 'string' && cell.value.length > 32767) {
//           cell.value = cell.value.substring(0, 32767) + '... [truncated]';
//         }
//       });
//     });

//     // ============ SHEET 2: FRANCHISE DETAILS ============
//     const franchiseSheet = workbook.addWorksheet('Franchise Details', {
//       properties: { tabColor: { argb: 'FF27AE60' } },
//       views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
//     });

//     const allFranchiseFields = new Set();
//     const franchiseRows = [];

//     brands.forEach((brand) => {
//       if (brand.franchiseDetails) {
//         // Extract categories specifically
//         const categories = brand.franchiseDetails.brandCategories || {};
        
//         const flatFranchise = {
//           'Brand ID': brand.brandID || '',
//           'Brand Name': brand.brandDetails?.brandName || '',
          
//           // Main Category fields
//           'Main Category': categories.main || '',
//           'Sub Category': categories.sub || '',
//           'Category Group ID': categories.groupId || '',
          
//           // Flatten all other franchise fields with proper names
//           ...flattenObjectWithProperNames(brand.franchiseDetails, 'Franchise')
//         };
        
//         franchiseRows.push(flatFranchise);
//         Object.keys(flatFranchise).forEach(key => allFranchiseFields.add(key));
//       }
//     });

//     const franchiseColumns = Array.from(allFranchiseFields).sort();
//     franchiseSheet.columns = franchiseColumns.map(field => ({
//       header: field,
//       key: field,
//       width: Math.min(50, Math.max(15, field.length + 5))
//     }));

//     franchiseSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
//     franchiseSheet.getRow(1).fill = {
//       type: 'pattern',
//       pattern: 'solid',
//       fgColor: { argb: 'FF27AE60' }
//     };

//     franchiseRows.forEach(rowData => {
//       const row = franchiseSheet.addRow(rowData);
//       row.eachCell({ includeEmpty: true }, (cell) => {
//         cell.border = {
//           top: { style: 'thin' },
//           left: { style: 'thin' },
//           bottom: { style: 'thin' },
//           right: { style: 'thin' }
//         };
//       });
//     });

//     // ============ SHEET 3: CATEGORIES DETAILED ============
//     const categorySheet = workbook.addWorksheet('Categories', {
//       properties: { tabColor: { argb: 'FFF39C12' } },
//       views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
//     });

//     categorySheet.columns = [
//       { header: 'Brand ID', key: 'brandID', width: 20 },
//       { header: 'Brand Name', key: 'brandName', width: 25 },
//       { header: 'Main Category', key: 'mainCategory', width: 25 },
//       { header: 'Sub Category', key: 'subCategory', width: 25 },
//       { header: 'Category Type', key: 'categoryType', width: 20 },
//       { header: 'Parent Category', key: 'parentCategory', width: 25 },
//       { header: 'Tags', key: 'tags', width: 50 },
//       { header: 'Tag ID', key: 'tagId', width: 30 },
//     ];

//     categorySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
//     categorySheet.getRow(1).fill = {
//       type: 'pattern',
//       pattern: 'solid',
//       fgColor: { argb: 'FFF39C12' }
//     };

//     brands.forEach((brand) => {
//       const categories = brand.franchiseDetails?.brandCategories;
      
//       if (categories) {
//         // Add product tags
//         if (categories.productTags && categories.productTags.length > 0) {
//           categories.productTags.forEach(productTag => {
//             const row = categorySheet.addRow({
//               brandID: brand.brandID || '',
//               brandName: brand.brandDetails?.brandName || '',
//               mainCategory: categories.main || '',
//               subCategory: categories.sub || '',
//               categoryType: 'Product Tags',
//               parentCategory: productTag.parent || '',
//               tags: productTag.tags ? productTag.tags.join(', ') : '',
//               tagId: productTag._id || '',
//             });
            
//             addBorders(row);
//           });
//         }

//         // Add service tags
//         if (categories.serviceTags && categories.serviceTags.length > 0) {
//           categories.serviceTags.forEach(serviceTag => {
//             const row = categorySheet.addRow({
//               brandID: brand.brandID || '',
//               brandName: brand.brandDetails?.brandName || '',
//               mainCategory: categories.main || '',
//               subCategory: categories.sub || '',
//               categoryType: 'Service Tags',
//               parentCategory: serviceTag.parent || '',
//               tags: serviceTag.tags ? serviceTag.tags.join(', ') : '',
//               tagId: serviceTag._id || '',
//             });
            
//             addBorders(row);
//           });
//         }
//       }
//     });

//     // ============ SHEET 4: FICO DETAILS ============
//     const ficoSheet = workbook.addWorksheet('FICO Details', {
//       properties: { tabColor: { argb: 'FFE67E22' } },
//       views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
//     });

//     ficoSheet.columns = [
//       { header: 'Brand ID', key: 'brandID', width: 20 },
//       { header: 'Brand Name', key: 'brandName', width: 25 },
//       { header: 'Investment Range', key: 'investmentRange', width: 25 },
//       { header: 'Area Required', key: 'areaRequired', width: 25 },
//       { header: 'Franchise Model', key: 'franchiseModel', width: 20 },
//       { header: 'Franchise Type', key: 'franchiseType', width: 20 },
//       { header: 'Franchise Fee', key: 'franchiseFee', width: 20 },
//       { header: 'Royalty Fee', key: 'royaltyFee', width: 15 },
//       { header: 'Stock Investment', key: 'stockInvestment', width: 20 },
//       { header: 'Interior Cost', key: 'interiorCost', width: 20 },
//       { header: 'Other Cost', key: 'otherCost', width: 20 },
//       { header: 'ROI %', key: 'roi', width: 10 },
//       { header: 'Payback Period', key: 'paybackPeriod', width: 20 },
//       { header: 'Break Even', key: 'breakEven', width: 15 },
//       { header: 'Working Capital', key: 'workingCapital', width: 20 },
//       { header: 'Margin on Sales %', key: 'marginOnSales', width: 15 },
//       { header: 'Agreement Period', key: 'agreementPeriod', width: 15 },
//     ];

//     ficoSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
//     ficoSheet.getRow(1).fill = {
//       type: 'pattern',
//       pattern: 'solid',
//       fgColor: { argb: 'FFE67E22' }
//     };

//     brands.forEach((brand) => {
//       const franchiseDetails = brand.franchiseDetails || {};
//       const ficoArray = franchiseDetails.fico || [];
      
//       ficoArray.forEach(fico => {
//         const row = ficoSheet.addRow({
//           brandID: brand.brandID || '',
//           brandName: brand.brandDetails?.brandName || '',
//           investmentRange: fico.investmentRange || '',
//           areaRequired: fico.areaRequired || '',
//           franchiseModel: fico.franchiseModel || '',
//           franchiseType: fico.franchiseType || '',
//           franchiseFee: fico.franchiseFee || '',
//           royaltyFee: fico.royaltyFee || '',
//           stockInvestment: fico.stockInvestment || '',
//           interiorCost: fico.interiorCost || '',
//           otherCost: fico.otherCost || '',
//           roi: fico.roi || '',
//           paybackPeriod: fico.payBackPeriod || '',
//           breakEven: fico.breakEven || '',
//           workingCapital: fico.requireWorkingCapital || '',
//           marginOnSales: fico.marginOnSales || '',
//           agreementPeriod: fico.agreementPeriod || '',
//         });
        
//         addBorders(row);
//       });
//     });

//     // ============ SHEET 5: UPLOADS ============
//     const uploadsSheet = workbook.addWorksheet('Uploads', {
//       properties: { tabColor: { argb: 'FF3498DB' } },
//       views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
//     });

//     uploadsSheet.columns = [
//       { header: 'Brand ID', key: 'brandID', width: 20 },
//       { header: 'Brand Name', key: 'brandName', width: 25 },
//       { header: 'Upload Type', key: 'uploadType', width: 25 },
//       { header: 'File URLs', key: 'fileUrls', width: 60 },
//       { header: 'Upload ID', key: 'uploadId', width: 30 },
//       { header: 'Created At', key: 'createdAt', width: 20 },
//       { header: 'Updated At', key: 'updatedAt', width: 20 },
//     ];

//     uploadsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
//     uploadsSheet.getRow(1).fill = {
//       type: 'pattern',
//       pattern: 'solid',
//       fgColor: { argb: 'FF3498DB' }
//     };

//     brands.forEach((brand) => {
//       if (brand.uploads && brand.uploads.length > 0) {
//         brand.uploads.forEach((upload) => {
//           const uploads = upload.uploads || {};
          
//           Object.keys(uploads).forEach(uploadType => {
//             const urls = uploads[uploadType];
//             if (urls && urls.length > 0) {
//               const row = uploadsSheet.addRow({
//                 brandID: brand.brandID || '',
//                 brandName: brand.brandDetails?.brandName || '',
//                 uploadType: uploadType,
//                 fileUrls: urls.join('\n'),
//                 uploadId: upload._id ? upload._id.toString() : '',
//                 createdAt: upload.createdAt ? new Date(upload.createdAt).toLocaleString() : '',
//                 updatedAt: upload.updatedAt ? new Date(upload.updatedAt).toLocaleString() : '',
//               });
              
//               addBorders(row);
//             }
//           });
//         });
//       }
//     });

//     // ============ SHEET 6: LOCATIONS ============
//     const locationSheet = workbook.addWorksheet('Locations', {
//       properties: { tabColor: { argb: 'FF9B59B6' } },
//       views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
//     });

//     locationSheet.columns = [
//       { header: 'Brand ID', key: 'brandID', width: 20 },
//       { header: 'Brand Name', key: 'brandName', width: 25 },
//       { header: 'Location Type', key: 'locationType', width: 20 },
//       { header: 'State', key: 'state', width: 20 },
//       { header: 'District', key: 'district', width: 20 },
//       { header: 'Cities', key: 'cities', width: 50 },
//     ];

//     locationSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
//     locationSheet.getRow(1).fill = {
//       type: 'pattern',
//       pattern: 'solid',
//       fgColor: { argb: 'FF9B59B6' }
//     };

//     brands.forEach((brand) => {
//       const expansionData = brand.brandexpansionlocationdatas?.[0]?.expansionLocationData;
      
//       // Current Outlets
//       if (expansionData?.currentOutletLocations?.domestic?.locations) {
//         expansionData.currentOutletLocations.domestic.locations.forEach((location) => {
//           location.districts?.forEach((district) => {
//             const row = locationSheet.addRow({
//               brandID: brand.brandID || '',
//               brandName: brand.brandDetails?.brandName || '',
//               locationType: 'Current Outlet',
//               state: location.state || '',
//               district: district.district || '',
//               cities: district.cities?.join(', ') || '',
//             });
            
//             addBorders(row);
//           });
//         });
//       }

//       // Expansion Locations
//       if (expansionData?.expansionLocations?.domestic?.locations) {
//         expansionData.expansionLocations.domestic.locations.forEach((location) => {
//           location.districts?.forEach((district) => {
//             const row = locationSheet.addRow({
//               brandID: brand.brandID || '',
//               brandName: brand.brandDetails?.brandName || '',
//               locationType: 'Expansion Location',
//               state: location.state || '',
//               district: district.district || '',
//               cities: district.cities?.join(', ') || '',
//             });
            
//             addBorders(row);
//           });
//         });
//       }
//     });

//     // ============ SHEET 7: VIEWS & ENGAGEMENT ============
//     const viewsSheet = workbook.addWorksheet('Views & Engagement', {
//       properties: { tabColor: { argb: 'FFE74C3C' } },
//       views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
//     });

//     viewsSheet.columns = [
//       { header: 'Brand ID', key: 'brandID', width: 20 },
//       { header: 'Brand Name', key: 'brandName', width: 25 },
//       { header: 'Total Views', key: 'totalViews', width: 15 },
//       { header: 'Investor Views', key: 'investorViews', width: 15 },
//       { header: 'Brand Views', key: 'brandViews', width: 15 },
//       { header: 'Shortlist Count', key: 'shortlistCount', width: 15 },
//       { header: 'Likes Count', key: 'likesCount', width: 15 },
//       { header: 'Last Active', key: 'lastActive', width: 20 },
//       { header: 'Active Status', key: 'activeStatus', width: 15 },
//     ];

//     viewsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
//     viewsSheet.getRow(1).fill = {
//       type: 'pattern',
//       pattern: 'solid',
//       fgColor: { argb: 'FFE74C3C' }
//     };

//     brands.forEach((brand) => {
//       const row = viewsSheet.addRow({
//         brandID: brand.brandID || '',
//         brandName: brand.brandDetails?.brandName || '',
//         totalViews: brand.totalViewCount || 0,
//         investorViews: brand.totalInvestorViews || 0,
//         brandViews: brand.totalBrandViews || 0,
//         shortlistCount: brand.totalSortlistCount || 0,
//         likesCount: brand.totalLikedCount || 0,
//         lastActive: brand.lastActive ? new Date(brand.lastActive).toLocaleString() : '',
//         activeStatus: brand.active ? 'Active' : 'Inactive',
//       });
      
//       addBorders(row);
//     });

//     /* ===============================
//        SEND EXCEL FILE
//     =============================== */
//     res.setHeader(
//       'Content-Type',
//       'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
//     );
//     res.setHeader(
//       'Content-Disposition',
//       `attachment; filename=brands_export_${new Date().toISOString().split('T')[0]}.xlsx`
//     );

//     await workbook.xlsx.write(res);
//     res.end();

//   } catch (error) {
//     console.error("exportBrandsToExcel error:", error);
//     return res.status(500).json(
//       new ApiResponse(500, null, "Failed to export brands to Excel")
//     );
//   }
// };

// // Helper function to flatten objects with proper names (handles MongoDB ObjectId)
// function flattenObjectWithProperNames(obj, prefix = '') {
//   if (!obj || typeof obj !== 'object') return { [prefix]: obj || '' };
  
//   // Handle MongoDB ObjectId
//   if (obj instanceof ObjectId || (obj._bsontype === 'ObjectId')) {
//     return { [prefix]: obj.toString() };
//   }
  
//   // Handle Date objects
//   if (obj instanceof Date) {
//     return { [prefix]: obj.toLocaleString() };
//   }
  
//   // Handle Arrays
//   if (Array.isArray(obj)) {
//     if (obj.length === 0) return { [prefix]: '' };
    
//     // If array contains primitive values, join them
//     const allPrimitives = obj.every(item => 
//       typeof item !== 'object' || item === null || item instanceof Date || item instanceof ObjectId
//     );
    
//     if (allPrimitives) {
//       return { [prefix]: obj.map(item => 
//         item instanceof ObjectId ? item.toString() : 
//         item instanceof Date ? item.toLocaleString() : 
//         item
//       ).join(', ') };
//     } else {
//       // For complex arrays, don't flatten further to avoid too many columns
//       return { [prefix]: JSON.stringify(obj).substring(0, 32767) };
//     }
//   }

//   // Handle regular objects
//   return Object.keys(obj).reduce((acc, key) => {
//     // Skip buffer arrays of ObjectId
//     if (key === 'buffer' && obj._bsontype === 'ObjectId') {
//       return acc;
//     }
    
//     // Create readable column name
//     const readableKey = key
//       .replace(/([A-Z])/g, ' $1') // Add space before capital letters
//       .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
//       .trim();
    
//     const propName = prefix ? `${prefix} - ${readableKey}` : readableKey;
    
//     if (obj[key] === null || obj[key] === undefined) {
//       acc[propName] = '';
//     } else if (typeof obj[key] === 'object') {
//       const flattened = flattenObjectWithProperNames(obj[key], propName);
//       Object.assign(acc, flattened);
//     } else {
//       acc[propName] = obj[key];
//     }
    
//     return acc;
//   }, {});
// }

// // Helper function to add borders to rows
// function addBorders(row) {
//   row.eachCell({ includeEmpty: true }, (cell) => {
//     cell.border = {
//       top: { style: 'thin' },
//       left: { style: 'thin' },
//       bottom: { style: 'thin' },
//       right: { style: 'thin' }
//     };
//   }); 
// } 



export const datafieldnewEntry = async (req, res) => {
  try {
    const exists = await IndustryManagement.find({})
      .select("-__v -_id -categories -serviceTags -createdAt -uuid -updatedAt");

    const newData = [];

    for (const a of exists) {
      for (const t of a.productTags) {
        for (const data of t.tags) {

          const brandsData = await BrandFranchiseDetails.aggregate([
            {
              $lookup: {
                from: "branddetails",
                localField: "brandOwnerId",
                foreignField: "uuid",
                as: "brandDetails",
              },
            },
            {
              $unwind: {
                path: "$brandDetails",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $match: {
                "franchiseDetails.brandCategories.main": a.industry,
                "franchiseDetails.brandCategories.productTags": {
                  $elemMatch: {
                    parent: t.parent,
                    tags: data.tag,
                  },
                },
              },
            },
            {
              $project: {
                _id: 0,
                brandName: "$brandDetails.brandDetails.brandName",
              },
            },
          ]);

          const brandNames =
            brandsData.length > 0
              ? brandsData.map(b => b.brandName).filter(Boolean)
              : [""];

          newData.push({
            industry: a.industry,
            category: t.parent,
            tag: data.tag,
            brands: brandNames,
            count: brandsData.length,
          });
        }
      }
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Data");

    console.log(workbook)
    worksheet.columns = [
      { header: "Industry", key: "industry", width: 25 },
      { header: "Category", key: "category", width: 25 },
      { header: "Tag", key: "tag", width: 25 },
      { header: "Brand Names", key: "brands", width: 40 },
      { header: "Brand Count", key: "count", width: 15 },
    ];

    newData.forEach(item => {
      worksheet.addRow({
        industry: item.industry,
        category: item.category,
        tag: item.tag,
        brands: item.brands.join(", "),
        count: item.count || 0,
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Ayan-00.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};