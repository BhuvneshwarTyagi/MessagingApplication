const express = require("express");
const router = express.Router();
const connection = require('./../DB_config/db');

router.get('/users',(req, res) => {
    const searchString = req.query.search || ''; // default to empty string if search is null
    const sql = `
      SELECT name, institution,role,id
      FROM users
      WHERE ? = '' OR (
      name LIKE ?
      OR email LIKE ?
      OR phone LIKE ?
      OR institution LIKE ?
      OR role LIKE ?
    )
      LIMIT 20 OFFSET 0;
    `;
  
    const searchParam = `%${searchString}%`;
    console.log(searchString);
    connection.query(sql, [searchString, searchParam, searchParam, searchParam, searchParam, searchParam], (err, results) => {
      if (err) {
        console.error('Error fetching users:', err);
        return res.status(500).json({ error: 'Error fetching users' });
      }
  
      // Return the first 20 users
      res.json(results);
    });
  });


  router.get('/user', (req, res) => {
    const searchString = req.query.id; // default to empty string if search is null
    const sql = `
      SELECT name, institution,role,email,phone
      FROM users
      WHERE id = ?
    `;
  

    connection.query(sql, [searchString], (err, results) => {
      if (err) {
        console.error('Error fetching users:', err);
        return res.status(500).json({ error: 'Error fetching users' });
      }
  
      // Return the first 20 users
      res.json(results);
    });
  });

module.exports = router;
