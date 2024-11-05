const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
dotenv.config();
const { Access_Expiry, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, Refresh_EXPIRY } = process.env;

const createAccessToken = (
    tokenData,
    tokenKey = ACCESS_TOKEN_SECRET,
    expiresIn = Access_Expiry
) => {

        const token = jwt.sign(tokenData,
            tokenKey, {
            expiresIn,
        });
        return token;
};

const createRefreshToken =  (
    tokenData,
    tokenKey = REFRESH_TOKEN_SECRET,
    expiresIn = Refresh_EXPIRY
) => {
        const token = jwt.sign(tokenData,
            tokenKey, {
            expiresIn,
        });
        return token;
};

const extractToken = (req, res, next) => {
    const excludedRoutes = ['/login', '/signup'];

    if (excludedRoutes.includes(req.path)) {
        return next(); 
    }
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ error: "Authorization header is missing" });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: "Bearer token is missing" });
    }

    req.token = token;
    const validate = verifyAccessToken(token);
    if(!validate){
        return res.status(401).json({ error: "Bad Request made" });
    }
    next();
};

const extractTokenSocket = (socket, next) => {
    const authHeader = socket.handshake.headers['authorization'];
    if (!authHeader) {
        return next(new Error("Authorization header is missing"));
    }

    const token = authHeader.split(' ')[1];
    console.log(token);
    if (!token) {
        return next(new Error("Bearer token is missing"));
    }

    const validate = verifyAccessToken(token);
    if (!validate.valid) {
        return next(new Error("Invalid token"));
    }

    socket.token = token; 
    next();
};


const verifyAccessToken = (token) => {

    //checking for provided token 
    if (!token) {
        return { valid: false, };
    }
    // verify token 
    return jwt.verify(token, ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return { valid: false};
        } else {
            return { valid: true };
        }
    });


};
module.exports = { createAccessToken, createRefreshToken,extractToken,extractTokenSocket };
