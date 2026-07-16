import XLSX from "xlsx";
import { BrandDetails } from "../../model/Brand/Brand.model/BrandDetails.model.js";

export const downloadBrandExcel = async (req, res) => {
  try {
    const brands = await BrandDetails.find({}).lean();

    const excelData = brands.map((item, index) => ({
      SNo: index + 1,
      UUID: item.uuid,
      BrandID: item.brandID,

      FullName: item.brandDetails?.fullName,
      Email: item.brandDetails?.email,
      MobileNumber: item.brandDetails?.mobileNumber,
      WhatsappNumber: item.brandDetails?.whatsappNumber,

      CompanyName: item.brandDetails?.companyName,
      BrandName: item.brandDetails?.brandName,
      Slug: item.brandDetails?.slug,
      TagLine: item.brandDetails?.tagLine,

      CEOName: item.brandDetails?.ceoName,
      CEOMobile: item.brandDetails?.ceoMobile,
      CEOEmail: item.brandDetails?.ceoEmail,

      OfficeEmail: item.brandDetails?.officeEmail,
      OfficeMobile: item.brandDetails?.officeMobile,

      HeadOfficeAddress: item.brandDetails?.headOfficeAddress,
      Country: item.brandDetails?.country,
      State: item.brandDetails?.state,
      District: item.brandDetails?.district,
      City: item.brandDetails?.city,
      Pincode: item.brandDetails?.pincode,

      Website: item.brandDetails?.website,
      Facebook: item.brandDetails?.facebook,
      Instagram: item.brandDetails?.instagram,
      Linkedin: item.brandDetails?.linkedin,

      GSTNumber: item.brandDetails?.gstNumber,
      PANCardNumber: item.brandDetails?.pancardNumber,

      SpecialFreeLeadCount: item.brandDetails?.specialFreeLeadCount,
      OverallLeads: item.brandDetails?.overAllLeads,

      Approved: item.brandDetails?.isApproved,
      Payment: item.brandDetails?.payment,
      Pause: item.brandDetails?.pause,
      BrandPause: item.brandDetails?.isBrandPause,

      PackageType: item.brandDetails?.paymentPackage?.packageType,
      TotalAmount: item.brandDetails?.paymentPackage?.totalAmount,
      TotalMonths: item.brandDetails?.paymentPackage?.totalMonths,
      PerMonthLead: item.brandDetails?.paymentPackage?.perMonthLead,
      TotalLeads: item.brandDetails?.paymentPackage?.totalLeads,
      PackageActive: item.brandDetails?.paymentPackage?.isActive,
      PackageEndDate: item.brandDetails?.paymentPackage?.packageEndDate,
      SentLeadPercentage:
        item.brandDetails?.paymentPackage?.sentLeadsPercentage,

      ListingMonths: item.brandDetails?.listingPackages?.periodMonths,
      ListingAmount: item.brandDetails?.listingPackages?.amount,

      Active: item.active,
      LastActive: item.lastActive,

      LoginPlatform: item.loginPlatform,

      CreatedAt: item.createdAt,
      UpdatedAt: item.updatedAt,
    }));

    const workbook = XLSX.utils.book_new();

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    XLSX.utils.book_append_sheet(workbook, worksheet, "Brands");

    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="BrandDetails.xlsx"'
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to download excel",
      error: error.message,
    });
  }
};