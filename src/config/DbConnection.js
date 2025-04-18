import  mongoose from "mongoose";

const connectDabase= async ()=>{
 await mongoose.connect(process.env.DB_URL).then((data) => {
    console.log(`MongoDB connected with server: ${process.env.CONNECT}`);
});



}
export default connectDabase;
