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

module.exports = { createAccessToken, createRefreshToken };
