import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const MONGODB_URI = process.env.DB_URL;
const TARGET_UUID = null; // or specific UUID

async function removePaymentPackage() {
  try {
    if (!MONGODB_URI) {
      throw new Error("DB_URL is undefined");
    }

    console.log("🔌 Connecting...");
    await mongoose.connect(MONGODB_URI);

    const db = mongoose.connection.db;

    const filter = TARGET_UUID ? { uuid: TARGET_UUID } : {};

    console.log("🚀 Removing paymentPackage from brandDetails...");

    // 🔍 CHECK FIRST
    const preview = await db
      .collection("branddetails")
      .find({ "brandDetails.paymentPackage": { $exists: true } })
      .limit(2)
      .toArray();

    console.log("\n🔍 Preview:");
    console.dir(preview, { depth: 3 });

    // 👉 remove this line to execute
    return;

    // ✅ REMOVE FROM branddetails
    const result1 = await db.collection("branddetails").updateMany(filter, {
      $unset: { "brandDetails.paymentPackage": 1 },
    });

    console.log("\n📦 branddetails:");
    console.log("Matched:", result1.matchedCount);
    console.log("Modified:", result1.modifiedCount);

    // ✅ REMOVE FROM brandlistings ALSO
    const collections = await db.listCollections().toArray();
    const names = collections.map((c) => c.name);

    if (names.includes("brandlistings")) {
      const result2 = await db.collection("brandlistings").updateMany(filter, {
        $unset: { "brandDetails.paymentPackage": 1 },
      });

      console.log("\n📦 brandlistings:");
      console.log("Matched:", result2.matchedCount);
      console.log("Modified:", result2.modifiedCount);
    }

    console.log("\n✅ DONE");
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected");
  }
}

removePaymentPackage();