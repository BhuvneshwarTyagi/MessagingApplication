const { createChatChannel } = require('./../../DB_config/create_tables');
const connection = require('./../../DB_config/db');
const {checkUserExists} = require('./../../utils/checkFields');
function initializeChatSocket(io, db) {
    const chatNamespace = io.of('/chat');

    chatNamespace.on('connection', (socket) => {
        console.log('A user connected to chat:', socket.id);

        // Listen for messages from the client
        socket.on('sendMessage', async (data) => {
            console.log('Message received:', data);
            const sender_id = data.user1_id;
            const userExists = await checkUserExists(sender_id,connection);
            if (!userExists) {
                console.error(`User with id ${sender_id} does not exist.`);
                return; // Optionally, emit an error message back to the client
            }
            // Destructure the incoming data
            const { chat_channel, message, reply_to } = data;

            
            // Store the message in the database
            try {
                // Create the chat channel and message table if it doesn't exist
                await createChatChannel(chat_channel, sender_id, data.user2_id);

                // Save the message to the chat channel table
                await saveMessageToDatabase(sender_id, chat_channel, message, reply_to);

                // Emit the message to the specific chat channel
                chatNamespace.emit('receiveMessage', data);
            } catch (error) {
                console.error('Error saving message to database:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log('A user disconnected from chat:', socket.id);
        });
    });
}

// Function to save the message in the specific chat channel table
const saveMessageToDatabase = (sender_id, chat_channel, message, reply_to = null, seen = false) => {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO ?? (sender_id, message, seen, reply_to) 
            VALUES (?, ?, ?, ?)`;

        // Using the chat channel name and the provided message details
        connection.query(sql, [chat_channel, sender_id, message, seen, reply_to], (err, result) => {
            if (err) return reject(err);
            updateLastMessage(chat_channel, message, sender_id)
            resolve(result);
        });
    });
};

const updateLastMessage = (chat_channel, last_msg, sender) => {
    return new Promise((resolve, reject) => {
        const sql = `
            UPDATE chat_channels
            SET last_msg = ?, sender = ?
            WHERE chat_channel = ?`;

        connection.query(sql, [last_msg, sender, chat_channel], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};



module.exports = initializeChatSocket;
