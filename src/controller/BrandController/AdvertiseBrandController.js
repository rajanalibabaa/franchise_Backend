import mongoose from "mongoose";
import PaymentPackages from "../../model/Brand/AdvertigeHandlingModel.js";

/**
 * @desc Create a new payment package
 * @route POST /api/payment-packages
 * @access Public or Admin (depending on your auth)
 */
export const createPaymentPackage = async (req, res) => {
  try {
    // Validate that required fields exist
    const requiredFields = ["free", "silver", "gold", "platinum", "exclusive", "listingPackages"];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({   
          success: false,
          message: `Missing required field: ${field}`,
        });
      }
    }

    const paymentPackage = await PaymentPackages.create(req.body);

    res.status(201).json({
      success: true,
      message: "Payment package created successfully",
      data: paymentPackage,
    });
  } catch (error) {
    console.error("Error creating payment package:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

/**
 * @desc Get all payment packages
 * @route GET /api/payment-packages
 * @access Public
 */
export const getAllPaymentPackages = async (req, res) => {
  try {
    const paymentPackages = await PaymentPackages.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: paymentPackages.length,
      data: paymentPackages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

/**
 * @desc Get a single payment package by ID
 * @route GET /api/payment-packages/:id
 * @access Public
 */
export const getPaymentPackageById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment package ID format",
      });
    }

    const paymentPackage = await PaymentPackages.findById(id);

    if (!paymentPackage) {
      return res.status(404).json({
        success: false,
        message: "Payment package not found",
      });
    }

    res.status(200).json({
      success: true,
      data: paymentPackage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

/**
 * @desc Update a payment package by UUID
 * @route PUT /api/v1/brandadvertise/payment/:uuid
 * @access Admin
 */
export const updatePaymentPackage = async (req, res) => {
  try {
    const { uuid } = req.params;

    if (!uuid) {
      return res.status(400).json({
        success: false,
        message: "UUID is required for update",
      });
    }

    // Find and update by UUID
    const updatedPaymentPackage = await PaymentPackages.findOneAndUpdate(
      { uuid },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedPaymentPackage) {
      return res.status(404).json({
        success: false,
        message: "Payment package not found with the provided UUID",
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment package updated successfully",
      data: updatedPaymentPackage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

/**
 * @desc Delete a payment package by UUID
 * @route DELETE /api/v1/brandadvertise/payment/:uuid
 * @access Admin
 */
export const deletePaymentPackage = async (req, res) => {
  try {
    const { uuid } = req.params;

    if (!uuid) {
      return res.status(400).json({
        success: false,
        message: "UUID is required for deletion",
      });
    }

    // Find and delete by UUID
    const deletedPaymentPackage = await PaymentPackages.findOneAndDelete({ uuid });

    if (!deletedPaymentPackage) {
      return res.status(404).json({
        success: false,
        message: "Payment package not found with the provided UUID",
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment package deleted successfully",
      data: deletedPaymentPackage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};