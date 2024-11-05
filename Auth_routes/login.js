const express = require("express");
const router = express.Router();
const { createRefreshToken, createAccessToken } = require("./../utils/jwt");
const { verifyHashedPassword } = require('./../utils/password_hashing');
const connection = require('./../DB_config/db');
const {checkFields} = require("../utils/checkFields");

router.post("", async (req, res) => {
    try {
        let { email, password } = req.body;

        checkFields(req.body);

        email = email.trim();
        password = password.trim();

        const userSQL = 'SELECT * FROM users WHERE email = ?';
        
        const fetchedUserResult = await new Promise((resolve, reject) => {
            connection.query(userSQL, [email], (error, results) => {
                if (error) {
                    console.error("Error fetching user data:", error);
                    return reject(error);
                }

                if (results.length === 0) {
                    console.log("No user found with this email.");
                    return resolve(null);
                }

                // Map the results to a user object
                const fetchedUser = results.map(user => ({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    password: user.password,
                    institution: user.institution,
                    createdAt: user.created_at,
                    updatedAt: user.updated_at
                }))[0];

                resolve(fetchedUser);
            });
        });
        
        if (!fetchedUserResult) {
            return res.status(404).json({ message: "No user found with this email." });
        }

        const hashedPassword = fetchedUserResult.password;

        const passwordMatch = await verifyHashedPassword(password, hashedPassword);

        if (!passwordMatch) {
            throw { message: "Invalid password entered" };
        }
        
        delete fetchedUserResult.password;
        const query = 'UPDATE users SET status = ? WHERE id = ?';
        connection.query(query, ['Online', fetchedUserResult.id], (error) => {
            if (error) {
                res.status(500).json({ error: 'Database update error' });
            }
        });
        
        const tokenData = {
            email,
            designation: fetchedUserResult.role
        };

        const accessToken = createAccessToken(tokenData);
        const refreshToken = createRefreshToken(tokenData);

        const tokens = { accessToken, refreshToken };

        res.status(200).json({ tokens, user: fetchedUserResult });

    } catch (error) {
        res.status(400).json({error});
    }
});

module.exports = router;
