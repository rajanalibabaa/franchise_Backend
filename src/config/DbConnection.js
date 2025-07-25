import mongoose from "mongoose";

const connectDatabase = async () => {
  try {
    // Ensure your DB_URL includes the correct database: Mrfranchise
    // Example in .env:
    // DB_URL=mongodb+srv://<user>:<pass>@mrfranchise.vanempq.mongodb.net/Mrfranchise?retryWrites=true&w=majority&appName=mrfranchise

    const conn = await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB connected successfully!`);
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`   Host: ${conn.connection.host}`);

    // List collections for debugging
    const collections = await conn.connection.db.listCollections().toArray();
    console.log(
      `   Collections: ${collections.map((c) => c.name).join(", ")}`
    );
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1); // Exit process if DB connection fails
  }
};

export default connectDatabase;
