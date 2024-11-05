const { checkUserExists } = require('../utils/checkFields');
const { extractTokenSocket } = require('../utils/jwt');

function initializeStatusSocket(io, db) {
    const statusNamespace = io.of("/status");
    statusNamespace.use(extractTokenSocket);

    statusNamespace.on("connection", async (socket) => {
        const by = socket.handshake.query.by;
        
        try {
            const userExists = await checkUserExists(by, db);
            
            if (!userExists) {
                console.error(`User with id ${by} does not exist.`);
                socket.emit("error", "User does not exist.");
                socket.disconnect();
                return;
            }

            console.log(`User ${by} connected`);

            // Update user status to Online
            await updateUserStatus(db, "Online", by);
            statusNamespace.emit("statusUpdate", { userId: by, status: "Online" });

            // Handle status check requests
            socket.on("check", async (userId) => {
                try {
                    const status = await getUserStatus(db, userId);
                    socket.emit("statusChecked", { userId, status });
                } catch (error) {
                    console.error("Error checking status:", error);
                    socket.emit("error", "Could not retrieve status.");
                }
            });

            // Handle disconnection
            socket.on("disconnect", async () => {
                try {
                    await updateUserStatus(db, "Offline", by);
                    statusNamespace.emit("statusUpdate", { userId: by, status: "Offline" });
                    console.log(`User ${by} disconnected`);
                } catch (error) {
                    console.error("Error updating Offline status:", error);
                }
            });

        } catch (error) {
            console.error("Error in connection handler:", error);
            socket.emit("error", "Internal server error");
            socket.disconnect();
        }
    });
}

// Helper functions for database operations
async function updateUserStatus(db, status, userId) {
    return new Promise((resolve, reject) => {
        const query = "UPDATE users SET status = ? WHERE id = ?";
        db.query(query, [status, userId], (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
}

async function getUserStatus(db, userId) {
    return new Promise((resolve, reject) => {
        const query = "SELECT status FROM users WHERE id = ?";
        db.query(query, [userId], (err, results) => {
            if (err) reject(err);
            else if (results.length === 0) reject(new Error("User not found"));
            else resolve(results[0].status);
        });
    });
}

module.exports = initializeStatusSocket;
