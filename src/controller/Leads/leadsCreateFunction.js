// import { getIndustryModel } from "../../model/Leads/leadsModels.js";
import { ApiResponse } from "../../utils/ApiResponse/ApiResponse.js";
import uuid from "../../utils/uuid.js";

export const leadsCreateFunction = async (body, exist, applyBy, applyId) => {
  // console.log('leads creation',body);

  try {
    const selectedIndustry =
      exist?.franchiseDetails?.franchiseDetails?.brandCategories?.main;

    if (!selectedIndustry) {
      return new ApiResponse(
        400,
        null,
        "Unable to create lead: industry category is missing",
      );
    }

    const generateUUID = uuid();

    const fields = {
      uuid: generateUUID,
      fullName: body?.fullName,
      email: body?.email,
      investorMobileNumber: body?.mobileNumber,
      state: body?.state,
      district: body?.district,
      city: body?.city,
      investmentRange: body?.investmentRange,
      planToInvest: body?.planToInvest,
      readyToInvest: body?.readyToInvest,
      brandId: body?.brandId,
      brandName: body?.brandName,
      brandEmail: exist?.brandDetails?.email,
      brandMobileNumber: exist?.brandDetails?.mobileNumber,
      brandLogo: exist?.uploads?.uploads?.brandLogo[0],
      industry: selectedIndustry,
      category: exist?.franchiseDetails?.franchiseDetails?.brandCategories?.sub,
      subCategory:
        exist?.franchiseDetails?.franchiseDetails?.brandCategories.child,
      apply: {
        applyBy,
        applyId,
      },
    };
const model =
  await getIndustryModel(
    selectedIndustry
  );

const data = await model.create(fields);

console.log("Model Name:", model.modelName);
console.log("Fields:", fields);


if (!data) {
  return new ApiResponse(
    500,
    null,
    "Something went wrong while saving lead"
  );
}

    return new ApiResponse(200, data, "Application submitted successfully");
  } catch (error) {
    console.error("Error in leadsCreateFunction:", error);
    return new ApiResponse(
      500,
      null,
      error?.message || "Internal server error",
    );
  }
};
