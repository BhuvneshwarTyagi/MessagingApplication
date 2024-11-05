const connection = require('./db');

const createChatChannel = (chatChannel, user1_id, user2_id) => {
    return new Promise((resolve, reject) => {
        const checkExistsSql = `
            SELECT COUNT(*) as count FROM chat_channels 
            WHERE chat_channel = ? AND ((user1_id = ? AND user2_id = ?) or (user1_id = ? AND user2_id = ?))`;
            
        connection.query(checkExistsSql, [chatChannel, user1_id, user2_id,user2_id,user1_id], (err, result) => {
            if (err) return reject(err);
            console.log(chatChannel, user1_id, user2_id,user2_id,user1_id);
            if (result[0].count > 0) {
                // Channel already exists, resolve the promise
                return resolve(true);
            }
            const insertMessageSql = `
                    CREATE TABLE ?? (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        sender_id INT,
                        message TEXT,
                        seen BOOLEAN DEFAULT FALSE,
                        reply_to INT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    )`;
            connection.query(insertMessageSql, [chatChannel], (err, result) => {
                if (err) return reject(err);
                const insertSql = `
                INSERT INTO chat_channels (chat_channel, user1_id, user2_id) 
                VALUES (?, ?, ?)`;

                connection.query(insertSql, [chatChannel, user1_id, user2_id], (err, result) => {
                    if (err) return reject(err);
                    resolve(true);
                });
            });


          

        });
    });
};




module.exports = { createChatChannel };
