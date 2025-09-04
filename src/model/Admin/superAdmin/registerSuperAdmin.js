import mongoose from "mongoose";


 const registerSuperAdminSchema= new mongoose.Schema({
    adminName: {
        type : String,
        required : true
    },
    adminEmail : {
        type : String,
        required : true,
        unique :true
    },
    uuid : {
        type : String,
        required : true,
        unique :true
    }
 })

export const RegisterSuperAdmin = mongoose.model('RegisterSuperAdmin',registerSuperAdminSchema)