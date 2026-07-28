import mongoose from "mongoose";
import dotenv from "dotenv";
import { BrandDetails } from "../src/model/Brand/Brand.model/BrandDetails.model.js";

dotenv.config({ path: "../.env" });

const MONGODB_URI = process.env.DB_URL;

const fix37CharacterBrandOwnerIds = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);

    console.log("✅ MongoDB connected");

    // Find only brandOwnerId with exactly 37 characters
    const brands = await BrandDetails.find({
      $expr: {
        $eq: [{ $strLenCP: "$uuid" }, 37],
      },
    });

    console.log(
      `Found ${brands.length} records with 37-character brandOwnerId`
    );

    for (const brand of brands) {
      const oldId = brand.uuid;

      // Remove the last character
      const newId = oldId.slice(0, -1);

      // Make sure new ID is exactly 36 characters
      if (newId.length !== 36) {
        console.log(
          `❌ Skipped: ${oldId} | New ID length: ${newId.length}`
        );
        continue;
      }

      console.log("\n--------------------------------");
      console.log("Old ID:", oldId);
      console.log("New ID:", newId);

      // Update database
      const result = await BrandDetails.updateOne(
        { _id: brand._id },
        {
          $set: {
            uuid: newId,
          },
        }
      );

      if (result.modifiedCount === 1) {
        console.log(`✅ Updated successfully`);
      } else {
        console.log(`⚠️ Update not performed`);
      }
    }

    console.log("\n✅ Process completed");

  } catch (error) {
    console.error("❌ Error:", error);

  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed");
  }
};

// Run script
fix37CharacterBrandOwnerIds();