const connection = require('./db');

const checkTable = (tableName) => {
    return new Promise((resolve, reject) => {
        const sql = `
        SELECT COUNT(*)
        FROM information_schema.tables 
        WHERE table_schema = 'MessagingApplication' 
        AND table_name = ?`;

        connection.query(sql, [tableName], (error, results) => {
            if (error) return reject(error);
            const tableExists = results[0]['COUNT(*)'] > 0;
            console.log(`Table ${tableName} exists: ${tableExists}`);
            resolve(tableExists);
        });
    });
}

const createUsersTable = () => {
    return new Promise((resolve, reject) => {
        const sql = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            phone INT,
            institution VARCHAR(20),
            role ENUM('Teacher', 'Student', 'Institute') NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

        )`;

        connection.query(sql, (err, result) => {
            if (err) return reject(err);
            resolve(true);
        });
    });
}

const createMessangingTable = () => {
    return new Promise((resolve, reject) => {
        const sql = `
        CREATE TABLE IF NOT EXISTS messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            sender_id INT NOT NULL,
            receiver_id INT NOT NULL,
            message TEXT NOT NULL,
            sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (sender_id) REFERENCES users(id),
            FOREIGN KEY (receiver_id) REFERENCES users(id)
        )`;

        connection.query(sql, (err, result) => {
            if (err) return reject(err);
            resolve(true);
        });
    });
}

module.exports = { checkTable, createMessangingTable, createUsersTable };
