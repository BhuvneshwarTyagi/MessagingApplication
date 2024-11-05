// Import modules
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const http = require("http");
const socketIo = require("socket.io");
const connection = require("./DB_config/db");
const initializeStatusSocket = require("./Sockets/status");
const initializeChatSocket = require("./Sockets/chat");
const initializeChannelsSocket  = require("./Sockets/chatChannel");
const { extractToken } = require("./utils/jwt");


// Initializing Express app and HTTP server
const app = express();
const server = http.createServer(app); 

// Initializing Socket.IO
const io = socketIo(server,{
    cors: {
        origin: "*", // Allow your React app's origin
    }
});

// Rate limiter configuration
const limiter = rateLimit({
    windowMs: 60000,
    max: 3000,
    message: "Too many requests from this IP, please try again later.",
});

// Middleware setup
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: '*', 
}));
app.use(extractToken);


// Routes import and usage
const login = require("./Auth_routes/login");
const signup = require("./Auth_routes/signup");
const updateUser = require("./Auth_routes/updateUserData");
const searchUsers = require('./Auth_routes/searchUsers');



app.use("/login", login);
app.use("/signup", signup);
app.use("/updateuser", updateUser);
app.use("/search", searchUsers);

app.use(express.static('public'));

initializeStatusSocket(io, connection);
initializeChatSocket(io, connection);
initializeChannelsSocket(io, connection);



// Starting the server for web Socket
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;