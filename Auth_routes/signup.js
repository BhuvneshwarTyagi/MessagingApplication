const express = require("express");
const router = express.Router();
const { hashPassword } = require("./../utils/password_hashing");
const {checkFields} = require("../utils/checkFields");
const connection = require('./../DB_config/db');

router.post("", async (req, res) => {
    try {
        let { name, email, phone, role, institution, password } = req.body;

       
        checkFields({ Name: name, Email: email, "Phone Number": phone, Role: role, Institution: institution, password });

     
        const hashedPassword = await hashPassword(password);
        const sql = `INSERT INTO users (name, email, phone, role, password, institution, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`;

        
        const query = (sql, params) => {
            return new Promise((resolve, reject) => {
                connection.query(sql, params, (error, results) => {
                    if (error) return reject(error);
                    resolve(results);
                });
            });
        };

        
        const results = await query(sql, [name, email, phone, role, hashedPassword, institution]);

        
        res.status(201).json({ message: 'User created successfully!', userId: results.insertId });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Email already exists.' });
        }
        console.error('Error inserting user:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

module.exports = router;
