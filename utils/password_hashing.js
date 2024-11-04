const bcrypt = require("bcrypt");

const hashPassword = async (password, saltRounds = 10) => {
    try {

        const hashedData = await bcrypt.hash(password, saltRounds);
        return hashedData;

    } catch (error) {
        throw error;
    }
};


const verifyHashedPassword = async (unhashed, hashed) => {
    try {

        const match = await bcrypt.compare(unhashed, hashed);
        return match;

    } catch (error) {

        throw error;

    }
}
module.exports = { hashPassword, verifyHashedPassword };
