const express = require('express');
const router = express.Router();
const connection = require('../DB_config/db');  

router.put('/:id', (req, res) => {
    const userId = req.params.id;
    const { name, email, phone, institution, role } = req.body;

    // Validate input
    if (!name || !email || !role) {
        return res.status(400).json({ error: 'Name, email, and role are required.' });
    }

    // SQL query to update the user
    const sql = `
        UPDATE users 
        SET name = ?, email = ?, phone = ?, institution = ?, role = ? 
        WHERE id = ?;
    `;

    const values = [name, email, phone, institution, role, userId];

    connection.query(sql, values, (err, results) => {
        if (err) {
            console.error('Error updating user:', err);
            return res.status(500).json({ error: 'Error updating user.' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.json({ message: 'User updated successfully.' });
    });
});

module.exports = router;
