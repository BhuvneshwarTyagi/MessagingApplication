function initializeSocket(io, db) {
   
    const statusNamespace = io.of("/status");

    statusNamespace.on("connection", (socket) => {
        const userId = socket.handshake.query.userId;

        console.log(`User ${userId} connected`);

        
        const query = "UPDATE users SET status = ? WHERE id = ?";
        db.query(query, ["online", userId], (err) => {
            if (err) {
                console.error("Error updating status:", err);
                return;
            }
          
            statusNamespace.emit("statusUpdate", { userId, status: "online" });
        });

        socket.on("disconnect", () => {
            db.query(query, ["offline", userId], (err) => {
                if (err) {
                    console.error("Error updating status:", err);
                    return;
                }
                statusNamespace.emit("statusUpdate", { userId, status: "offline" });
            });
        });
    });
}

module.exports = initializeSocket;
