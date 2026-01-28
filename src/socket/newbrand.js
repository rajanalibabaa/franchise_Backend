import NewIncomingBrands from "../model/Brand/newIncomigBrands.js";

export const newbrand = (socket, io) => {
  socket.on("newbrand", async(brand) => {
    const count = await NewIncomingBrands.find({})
    // console.log("📢 New brand added:", count.length);
    
    socket.broadcast.emit("recevie", count.length);

  });
};


