// db.js
import mongoose from "mongoose";

const connectDatabase = async () => {
  try {
    // Use DB_URL from your .env
    const conn = await mongoose.connect(process.env.DB_URL, {
      maxPoolSize: 50, // allows multiple queries in parallel
    });

    console.log(`✅ MongoDB connected successfully!`);
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`   Host: ${conn.connection.host}`);

    // Optional: List collections for debug
    const collections = await conn.connection.db.listCollections().toArray();
    console.log(
      `   Collections: ${collections.map((c) => c.name).join(", ") || "none"}`
    );
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    // Exit process so nodemon restarts it
    process.exit(1);
  }
};

export default connectDatabase;
