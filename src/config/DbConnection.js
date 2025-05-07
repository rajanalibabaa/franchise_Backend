import mongoose from "mongoose";

const connectDabase = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log(`✅ MongoDB connected with server: ${process.env.CONNECT}`);
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
  }
};

export default connectDabase;
