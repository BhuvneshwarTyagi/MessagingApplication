const {checkUserExists} = require('./../../utils/checkFields');

function initializeStatusSocket(io, db) {
   
    const statusNamespace = io.of("/status");

    statusNamespace.on("connection", async(socket) => {
        const userId = socket.handshake.query.userId;
        const by = socket.handshake.query.by;
        const userExists = await checkUserExists(by,db);
        if (!userExists) {
            console.error(`User with id ${sender_id} does not exist.`);
            return; // Optionally, emit an error message back to the client
        }

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

module.exports = initializeStatusSocket;
