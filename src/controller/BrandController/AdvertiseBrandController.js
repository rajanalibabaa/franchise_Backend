import mongoose from "mongoose";
import PaymentPackages from "../../model/Brand/AdvertigeHandlingModel.js";

/**
 * @desc Create a new payment package
 * @route POST /api/payment-packages
 * @access Public or Admin (depending on your auth)
 */
// export const createPaymentPackage = async (req, res) => {
//   try {
//     // Validate that required fields exist
//     const requiredFields = ["free","basic", "basicPro","silver", "gold", "platinum",  "listingPackages"];
//     console.log("req.body :", req.body);
//     for (const field of requiredFields) {
//       if (!req.body[field]) {
//         return res.status(400).json({   
//           success: false,
//           message: `Missing required field: ${field}`,
//         });
//       }
//     }

//     const paymentPackage = await PaymentPackages.create(req.body);

//     res.status(201).json({
//       success: true,
//       message: "Payment package created successfully",
//       data: paymentPackage,
//     });
//   } catch (error) {
//     console.error("Error creating payment package:", error);
//     res.status(500).json({
//       success: false,
//       message: error.message || "Internal Server Error",
//     });
//   }
// };
export const createPaymentPackage = async (req, res) => {
  try {
    const { packages, listingPackages } = req.body;

    if (!packages || !Array.isArray(packages) || packages.length === 0) {
      return res.status(400).json({
        success: false,
        message: "packages array is required and cannot be empty"
      });
    }

    if (!listingPackages || !Array.isArray(listingPackages)) {
      return res.status(400).json({
        success: false,
        message: "listingPackages must be an array"
      });
    }

    const newPackage = await PaymentPackages.create({
      packages,
      listingPackages,
    });

    res.status(201).json({
      success: true,
      message: "Payment packages created successfully",
      data: newPackage,
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
    console.error("Error fetching payment packages:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

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

// export const updatePaymentPackage = async (req, res) => {
//   try {
//     const { uuid } = req.params;

//     if (!uuid) {
//       return res.status(400).json({
//         success: false,
//         message: "UUID is required for update",
//       });
//     }

//     // Find and update by UUID
//     const updatedPaymentPackage = await PaymentPackages.findOneAndUpdate(
//       { uuid },
//       req.body,
//       { new: true, runValidators: true }
//     );

//     if (!updatedPaymentPackage) {
//       return res.status(404).json({
//         success: false,
//         message: "Payment package not found with the provided UUID",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Payment package updated successfully",
//       data: updatedPaymentPackage,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message || "Internal Server Error",
//     });
//   }
// };

export const updatePaymentPackage = async (req, res) => {
  try {
    const { uuid, type, index } = req.params;

    if (!uuid || !type || index === undefined) {
      return res.status(400).json({
        success: false,
        message: "uuid, type, and index are required (type = packages | listingPackages)",
      });
    }

    if (!["packages", "listingPackages"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid type. Use 'packages' or 'listingPackages'",
      });
    }

    const updateData = req.body;

    // Build dynamic key: packages.0.fieldName
    const updateKey = `${type}.${index}`;

    // Wrap update inside $set
    const updateObj = {};
    for (const key in updateData) {
      updateObj[`${updateKey}.${key}`] = updateData[key];
    }

    const updatedDoc = await PaymentPackages.findOneAndUpdate(
      { uuid },
      { $set: updateObj },
      { new: true, runValidators: true }
    );

    if (!updatedDoc) {
      return res.status(404).json({
        success: false,
        message: "Document not found with given UUID",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Package updated successfully",
      data: updatedDoc,
    });
  } catch (error) {
    console.error("Error updating package:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};


export const AddpackageUpdate = async (req, res) => {
  console.log("Add Package Update called");
  try {
    const { uuid, type, index } = req.params;
    console.log("Params:", req.params);
    const newData = req.body;
    console.log("New Data:", newData);

    if (!uuid) {
      return res.status(400).json({
        success: false,
        message: "UUID required",
      });
    }

    if (!["packages", "listingPackages"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Type must be packages or listingPackages",
      });
    }

    const insertIndex = parseInt(index);
    if (isNaN(insertIndex)) {
      return res.status(400).json({
        success: false,
        message: "Index must be a number",
      });
    }

    const payment = await PaymentPackages.findOne();
    console.log("Payment Package Found:", payment);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment package not found",
      });
    }

    // Insert at index
    payment[type].splice(insertIndex, 0, newData);

    const savedPayment = await payment.save();
    console.log("Saved Payment Package:", savedPayment);

    res.status(200).json({
      success: true,
      message: `${type} item added successfully`,
      data: savedPayment,
    });
  } catch (error) {
    console.error("Add Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const deletePaymentPackage = async (req, res) => {
  console.log("Delete Payment Package called");
  try {
    const { uuid, type, index } = req.params;

    if (!uuid) {
      return res.status(400).json({
        success: false,
        message: "UUID is required",
      });
    }

    // allowed arrays
    if (!["packages", "listingPackages"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Type must be 'packages' or 'listingPackages'",
      });
    }

    const idx = parseInt(index);
    if (isNaN(idx)) {
      return res.status(400).json({
        success: false,
        message: "Index must be a number",
      });
    }

    // find document
    const payment = await PaymentPackages.findOne({ uuid });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment package not found",
      });
    }

    // validate index
    if (idx < 0 || idx >= payment[type].length) {
      return res.status(400).json({
        success: false,
        message: "Invalid index position",
      });
    }

    // remove item from array
    payment[type].splice(idx, 1);

    // save
    await payment.save();

    res.status(200).json({
      success: true,
      message: `${type} item deleted successfully`,
      data: payment,
    });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
