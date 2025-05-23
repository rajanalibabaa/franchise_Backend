import mongoose from "mongoose";

const InstaApplySchema = mongoose.Schema({
   name: { type: String, required: true },
   email: { type: String, required: true },
   mobilenumber: { type: String, required: true, unique: true },
   state: { type: String, required: true },
   city: { type: String, required: true },
   pincode: { type: String, required: true },
   address: { type: String, required: true },
   timestamp: { type: Date, default: Date.now },
});

const InstaApply = mongoose.model("InstaApply", InstaApplySchema);
export default InstaApply; // Use default export 