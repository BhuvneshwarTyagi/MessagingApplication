const { createChatChannel } = require('./../../DB_config/create_tables');
const connection = require('./../../DB_config/db');
const { checkUserExists } = require('./../../utils/checkFields');

function initializeChatSocket(io, db) {
    const chatNamespace = io.of('/chat');
    
    // Track active users and their channels
    const activeUsers = new Map();
    const userChannels = new Map();

    chatNamespace.on('connection', async (socket) => {
        console.log('A user connected to chat:', socket.id);
        
        // Handle user joining with their ID and channel
        socket.on('userJoined', ({ userId, chatChannel }) => {
            activeUsers.set(socket.id, userId);
            socket.join(chatChannel);
            userChannels.set(socket.id, chatChannel);
        });

        // Handle joining specific channels
        socket.on('joinChannel', (channel) => {
            const previousChannel = userChannels.get(socket.id);
            if (previousChannel) {
                socket.leave(previousChannel);
            }
            socket.join(channel);
            userChannels.set(socket.id, channel);
        });

        // Handle leaving channels
        socket.on('leaveChannel', (channel) => {
            socket.leave(channel);
            userChannels.delete(socket.id);
        });
        
        socket.on('fetchInitialMessages', async (chatChannel) => {
            const sql = `
                SELECT m.*, 
                       r.message as reply_message,
                       r.sender_id as reply_sender_id
                FROM ?? m
                LEFT JOIN ?? r ON m.reply_to = r.id
                ORDER BY m.created_at DESC 
                LIMIT 50`;
        
            try {
                const result = await new Promise((resolve, reject) => {
                    connection.query(sql, [chatChannel, chatChannel], (err, result) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(result.reverse());
                        }
                    });
                });
        
                socket.emit('initialMessages', result);
            } catch (error) {
                console.error('Error fetching initial messages:', error);
                socket.emit('errorFetchingMessages', 'Could not fetch messages');
            }
        });

        socket.on('sendMessage', async (data) => {
            const sender_id = data.user1_id;
            const userExists = await checkUserExists(sender_id, db);
            if (!userExists) {
                console.error(`User with id ${sender_id} does not exist.`);
                return;
            }

            try {
                await createChatChannel(data.chat_channel, sender_id, data.user2_id);
                
                // If this is a reply, verify the replied-to message exists
                if (data.reply_to) {
                    const replyExists = await checkMessageExists(data.chat_channel, data.reply_to);
                    if (!replyExists) {
                        socket.emit('errorSavingMessage', 'Replied message does not exist');
                        return;
                    }
                }
                
                const savedMessage = await saveMessageToDatabase(sender_id, data.chat_channel, data.message, data.reply_to);
                
                // Fetch the reply message details if this is a reply
                let replyDetails = null;
                if (data.reply_to) {
                    replyDetails = await getMessageById(data.chat_channel, data.reply_to);
                }
                
                // Emit to the specific channel with reply details
                chatNamespace.to(data.chat_channel).emit('receiveMessage', {
                    ...data,
                    message_id: savedMessage.insertId,
                    timestamp: new Date(),
                    reply_details: replyDetails
                });
            } catch (error) {
                console.error('Error saving message to database:', error);
                socket.emit('errorSavingMessage', 'Could not save message');
            }
        });

        socket.on('disconnect', () => {
            const channel = userChannels.get(socket.id);
            if (channel) {
                socket.leave(channel);
                userChannels.delete(socket.id);
            }
            activeUsers.delete(socket.id);
            console.log('A user disconnected from chat:', socket.id);
        });

        // Update seen message handlers to be channel-specific
        socket.on('messageSeen', async (data) => {
            try {
                await markMessageAsSeen(data.chat_channel, data.message_id, data.user_id);
                chatNamespace.to(data.chat_channel).emit('messageSeenUpdate', data);
            } catch (error) {
                console.error('Error marking message as seen:', error);
            }
        });

        socket.on('openChat', async (data) => {
            try {
                await markAllMessagesSeen(data.chat_channel, data.user_id);
                chatNamespace.to(data.chat_channel).emit('messagesBulkSeen', data);
            } catch (error) {
                console.error('Error marking messages as seen:', error);
            }
        });
    });
}
const saveMessageToDatabase = async (sender_id, chat_channel, message, reply_to = null, seen = false) => {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO ?? (sender_id, message, seen, reply_to) 
            VALUES (?, ?, ?, ?)`;

        connection.query(sql, [chat_channel, sender_id, message, seen, reply_to], async (err, result) => {
            if (err) return reject(err);
            await updateLastMessage(chat_channel, message, sender_id);
            resolve(result);
        });
    });
};

const checkMessageExists = async (chat_channel, message_id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT 1 FROM ?? WHERE id = ? LIMIT 1';
        connection.query(sql, [chat_channel, message_id], (err, result) => {
            if (err) return reject(err);
            resolve(result.length > 0);
        });
    });
};

const getMessageById = async (chat_channel, message_id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT id, sender_id, message, created_at FROM ?? WHERE id = ? LIMIT 1';
        connection.query(sql, [chat_channel, message_id], (err, result) => {
            if (err) return reject(err);
            resolve(result[0]);
        });
    });
};

const markMessageAsSeen = async (chat_channel, message_id, user_id) => {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO message_seen (message_id, user_id, chat_channel)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE seen_at = CURRENT_TIMESTAMP`;
            
        connection.query(sql, [message_id, user_id, chat_channel], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

const markAllMessagesSeen = async (chat_channel, user_id) => {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO message_seen (message_id, user_id, chat_channel)
            SELECT id, ?, ? 
            FROM ?? 
            WHERE sender_id != ?
            AND id NOT IN (
                SELECT message_id 
                FROM message_seen 
                WHERE user_id = ?
            )`;
            
        connection.query(sql, [user_id, chat_channel, chat_channel, user_id, user_id], (err, result) => {
            if (err) return reject(err);
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