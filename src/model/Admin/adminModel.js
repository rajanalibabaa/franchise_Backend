import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  otp: String,
  otpExpires: Date,
});

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
