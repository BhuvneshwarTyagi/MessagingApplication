require("./DB_config/db");

const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();
app.use(cors());
app.options('*', cors());
const limiter = rateLimit({
    windowMs: 60000,
    max: 3000,
    message: 'Too many requests from this IP, please try again later.'
});

 // Trust first proxy
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes import

const login = require("./Auth_routes/login");
const signup = require("./Auth_routes/signup");




// Routes use
app.use("/login", login);
app.use("/signup", signup);









module.exports = app;
