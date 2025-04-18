import  mongoose from "mongoose";

const connectDabase= async ()=>{
 await mongoose.connect(process.env.DB_URL).then((data) => {
    console.log(`MongoDB connected with server: ${process.env.CONNECT}`);
});



};
<<<<<<< HEAD
export default connectDabase;
=======
export default connectDabase;
>>>>>>> 984cedd3c91169da5c9b7da3a7fa5ba77a974b75
