const express = require('express');
const router = express.Router();
const connection = require('../DB_config/db'); // Adjust the path according to your project structure
const checkFields = require('../utils/checkFields');

// Update user details
router.put('/:id', (req, res) => {
    const userId = req.params.id;
    const { name, email, status } = req.body; // Expecting these fields to be in the request body

    checkFields(req.body);
    

    // SQL query to update user details
    const query = 'UPDATE users SET name = ?, email = ?, status = ? WHERE id = ?';
    
    connection.query(query, [name, email, status, userId], (err, result) => {
        if (err) {
            console.error('Error updating user:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'User updated successfully' });
    });
});

module.exports = router;
