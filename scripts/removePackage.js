import mongoose from "mongoose";
import dotenv from "dotenv";

// ✅ Load environment variables from .env file
dotenv.config();

const MONGODB_URI = process.env.DB_URL;

// ✅ Replace with the UUID you want to clean
const TARGET_UUID = "4c334275-a786-4c0a-8b62-3a745bdd80a1";

async function removePaymentFieldsByUUID() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected successfully!");

    const db = mongoose.connection.db;

   
    const brandDetailsResult = await db.collection("branddetails").updateOne(
      { uuid: TARGET_UUID },
      {
        $unset: {
          "brandDetails.paymentPackage": "",
          "brandDetails.listingPackages": "",
        },
      }
    );

    console.log("\n📦 branddetails collection:");
    console.log(`   Matched: ${brandDetailsResult.matchedCount}`);
    console.log(`   Modified: ${brandDetailsResult.modifiedCount}`);

    if (brandDetailsResult.matchedCount === 0) {
      console.log(`   ⚠️  No document found with uuid: ${TARGET_UUID}`);
    }

    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);

    if (collectionNames.includes("brandlistings")) {
      const brandListingResult = await db
        .collection("brandlistings")
        .updateOne(
          { uuid: TARGET_UUID },
          {
            $unset: {
              "brandDetails.paymentPackage": "",
              "brandDetails.listingPackages": "",
            },
          }
        );

      console.log("\n📦 brandlistings collection:");
      console.log(`   Matched: ${brandListingResult.matchedCount}`);
      console.log(`   Modified: ${brandListingResult.modifiedCount}`);
    } else {
      console.log("\n⚠️  brandlistings collection not found, skipping...");
    }


    if (collectionNames.includes("paymentpackagehistories")) {
      const historyResult = await db
        .collection("paymentpackagehistories")
        .deleteMany({ uuid: TARGET_UUID });

      console.log("\n📦 paymentpackagehistories collection:");
      console.log(`   Deleted: ${historyResult.deletedCount}`);
    } else {
      console.log(
        "\n⚠️  paymentpackagehistories collection not found, skipping..."
      );
    }

    console.log(`\n✅ Payment fields removed for UUID: ${TARGET_UUID}`);
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

removePaymentFieldsByUUID();