const express = require("express");
const router = express.Router();

const connection = require('./../DB_config/db');

router.get("/:chat_channel", async (req, res) => {
    try {
        const chat_channel = req.params.chat_channel;
        if(!chat_channel){
            throw new Error('Bad Request')
        }

     
        
        const sql = `SELECT * from ?? LIMIT 50`;

        
        const query = (sql,params) => {
            return new Promise((resolve, reject) => {
                connection.query(sql, params, (error, results) => {
                    if (error) return reject(error);
                    resolve(results);
                });
            });
        };

        
        const results = await query(sql, [chat_channel]);

        
        res.status(201).json({ messages: results });

    } catch (error) {

        res.status(500).json({ message: 'Internal server error.' });
    }
});

module.exports = router;
