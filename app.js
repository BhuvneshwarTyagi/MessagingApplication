// Import modules
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const http = require("http");
const socketIo = require("socket.io");
const connection = require("./DB_config/db");
const initializeStatusSocket = require("./chat_routes/Sockets/status");
const initializeChatSocket = require("./chat_routes/Sockets/chat");


// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app); 

// Initialize Socket.IO
const io = socketIo(server);

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
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));


// Routes import and usage
const login = require("./Auth_routes/login");
const signup = require("./Auth_routes/signup");
const updateUser = require("./Auth_routes/updateUserData");



app.use("/login", login);
app.use("/signup", signup);
app.use("/updateuser", updateUser);
app.use(express.static('public'));

initializeStatusSocket(io, connection);
initializeChatSocket(io, connection);


// Start the server for web Socket
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;