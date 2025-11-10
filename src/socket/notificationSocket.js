let connectedAdmins = [];

export const registerNotificationSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("admin_join", (adminId) => {
      connectedAdmins.push({ adminId, socketId: socket.id });
      console.log("Admin joined:", adminId);
    });

    socket.on("disconnect", () => {
      connectedAdmins = connectedAdmins.filter(a => a.socketId !== socket.id);
      console.log("Disconnected:", socket.id);
    });
  });
};

export const sendAdminNotification = (io, data) => {
  io.emit("new_notification", data); // send to all admins
};
