import UserRequest from "../../../model/Brand/userRequestNotificationModel.js";
import {BrandDetails} from "../../../model/Brand/Brand.model/BrandDetails.model.js";
import { sendAdminNotification } from "../../../socket/notificationSocket.js";
import mongoose from "mongoose";
import { BrandUploads } from "../../../model/Brand/Brand.model/Uploads.model.js";

export const submitRequest = async (req, res) => {
  try {
    const { brandId, type, message,  contactDetails } = req.body;

    // Validation
    if (!brandId || !type) {
      return res.status(400).json({ success: false, message: "brandId and type are required" });
    }

        const brandLogoGet = await BrandUploads.findOne({ brandOwnerId: brandId });
    // console.log('Finding brand logo on schema', brandLogoGet);

    // ✅ Fetch brand details using brandId (uuid)
    const brand = await BrandDetails.findOne({ uuid: brandId });


    if (!brandLogoGet) {
      // console.log('brand',brandLogoGet);
    }

    
    if (!brand) {
      return res.status(404).json({ success: false, message: "Brand not found" });
    }

    // Extract brand info
    const brandName = brand?.brandDetails?.brandName || "Unknown Brand";
    const brandEmail = brand?.brandDetails?.email || "not-available";
    const brandOriginalId = brand?.brandID || "not-available";
const brandLogo = brandLogoGet?.uploads?.brandLogo[0] || "not-available";
// console.log('creating logo',brandLogo);

    const mobileNumber = brand?.brandDetails?.mobileNumber || "not-available";
    const whatsappNumber = brand?.brandDetails?.whatsappNumber || "not-available";

    // Create new request
    const newRequest = await UserRequest.create({
      brandOriginalId,
      brandId,
      brandName,
      brandEmail,
      brandLogo,
      mobileNumber,
      whatsappNumber,
      type,
      message,
      contactDetails,
    });

    // 🔔 Send real-time notification to admins
    sendAdminNotification(req.app.get("io"), {

      requestId: newRequest.uuid,
      brandOriginalId,
      brandEmail,
      brandName,
      mobileNumber,
      brandLogo,
      whatsappNumber,
      brandId,
      type,
      message,
      contactDetails,
      createdAt: newRequest.createdAt,
    });

    res.status(201).json({
      success: true,
      message: "Request sent successfully!",
      data: newRequest,
    });
  } catch (error) {
    console.error("Submit Request Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllRequests = async (req, res) => {
  try {
    const requests = await UserRequest.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    console.error("Get All Requests Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Request By ID
export const getRequestById = async (req, res) => {
  try {
    const { uuid } = req.params;
    console.log('Fetching by uuid:', uuid);

    const request = await UserRequest.findOne({ uuid });

    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    console.error("Get Request By ID Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// Update Request By ID
export const updateRequestById = async (req, res) => {
  try {
    const { uuid } = req.params;
    const { action } = req.body; // e.g., "create", "view", "open", "activate", etc.
    let updateData = {};

    // 🧠 Action-based update logic
    switch (action) {
      case "create":
        updateData = {
          isActive: true,
          isViewed: false,
          isOpened: false,
        };
        break;

      case "view":
        updateData = { isViewed: true };
        break;

      case "open":
        updateData = { isOpened: true };
        break;

      case "activate":
        updateData = { isActive: true };
        break;

      case "deactivate":
        updateData = { isActive: false };
        break;

      default:
        // If no specific action, allow manual updates from body
        updateData = req.body;
        break;
    }

    // 🔍 Update by UUID
    const updatedRequest = await UserRequest.findOneAndUpdate(
      { uuid },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedRequest) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

    res.status(200).json({
      success: true,
      message: "Request updated successfully",
      data: updatedRequest,
    });
  } catch (error) {
    console.error("Update Request By ID Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};




export const getRequestByBrandId = async (req, res) => {
  try {

    const { brandId } = req.params;

    // find all requests matching that brandId
    const requests = await UserRequest.find({ brandId }).sort({ createdAt: -1 });

    if (!requests.length) {
      return res.status(404).json({
        success: false,
        message: "No requests found for this brandId",
      });
    }

    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error("Error fetching requests by brandId:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const deleteRequestByBrandUuid = async (req, res) => {
  try {
    const { uuid } = req.params;

    const deleted = await UserRequest.deleteMany({ uuid });

    if (deleted.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No requests found to delete for this uuid",
      });
    }

    res.status(200).json({
      success: true,
      message: `Deleted ${deleted.deletedCount} request(s) for uuid: ${uuid}`,
    });
  } catch (error) {
    console.error("Error deleting requests by uuid:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



