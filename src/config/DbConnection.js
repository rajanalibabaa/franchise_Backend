import  mongoose from "mongoose";

const connectDabase= async ()=>{
 await mongoose.connect(process.env.DB_URL).then((data) => {
    console.log(`MongoDB connected with server: ${process.env.CONNECT}`);
});



};
<<<<<<< HEAD
export default connectDabase;
=======
<<<<<<< HEAD
export default connectDabase;
=======
export default connectDabase;
>>>>>>> 984cedd3c91169da5c9b7da3a7fa5ba77a974b75
>>>>>>> 3e7954f980a44a0ff8e0734c11b5fc05bd36c29d
