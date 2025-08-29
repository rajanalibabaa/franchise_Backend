import { newbrand } from "./newbrand.js";

export const mainSocket = (socket, io) => {
  console.log("✅ A user connected:", socket.id);

  
  // ✅ register newbrand listener
  newbrand(socket, io);

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
};
