const connection = require('../DB_config/db');
const { extractTokenSocket } = require('../utils/jwt');
function initializeChannelsSocket(io) {
    const channelsNamespace = io.of('/channels');

    // Track active users
    const activeUsers = new Map();
    channelsNamespace.use(extractTokenSocket);

    channelsNamespace.on('connection', async (socket) => {
        console.log('A user connected to channels namespace:', socket.id);

        // Handle user joining
        socket.on('userJoined', (userId) => {
            activeUsers.set(socket.id, userId);
            // Fetch initial channels for the user
            fetchUserChannels(userId).then(channels => {
                socket.emit('initialChannels', channels);
            }).catch(error => {
                console.error('Error fetching initial channels:', error);
                socket.emit('errorFetchingChannels', 'Could not fetch channels');
            });
        });

        // Handle fetching user's channels
        socket.on('fetchChannels', async (userId) => {
            try {
                const channels = await fetchUserChannels(userId);
                socket.emit('channelsUpdate', channels);
            } catch (error) {
                console.error('Error fetching channels:', error);
                socket.emit('errorFetchingChannels', 'Could not fetch channels');
            }
        });

        // Handle searching channels
        socket.on('searchChannels', async ({ userId, searchTerm }) => {
            try {
                const channels = searchTerm && searchTerm.trim() !== '' ? await searchUserChannels(userId, searchTerm) : await fetchUserChannels(userId);
                socket.emit('searchResults', channels);
            } catch (error) {
                console.error('Error searching channels:', error);
                socket.emit('errorSearchingChannels', 'Could not search channels');
            }
        });

        // Subscribe to specific channel updates
        socket.on('subscribeToChannel', (channelId) => {
            socket.join(`channel:${channelId}`);
        });

        // Unsubscribe from specific channel updates
        socket.on('unsubscribeFromChannel', (channelId) => {
            socket.leave(`channel:${channelId}`);
        });

        socket.on('disconnect', () => {
            activeUsers.delete(socket.id);
            console.log('A user disconnected from channels:', socket.id);
        });
    });

    // Function to fetch user's channels
    const fetchUserChannels = (userId) => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT 
                                chat_channels.*, 
                                CASE 
                                    WHEN chat_channels.user1_id = ? THEN chat_channels.user2_id
                                    ELSE chat_channels.user1_id
                                END AS other_user_id,
                                users.name AS other_username
                            FROM chat_channels
                            JOIN users ON (
                                CASE 
                                    WHEN chat_channels.user1_id = ? THEN chat_channels.user2_id
                                    ELSE chat_channels.user1_id
                                END = users.id
                            )
                            WHERE chat_channels.user1_id = ? OR chat_channels.user2_id = ?
                            ORDER BY chat_channels.updated_at DESC

`;

          


            connection.query(
                sql,
                [userId, userId, userId, userId, userId, userId],
                (err, result) => {
                    if (err) return reject(err);
                    console.log(result)
                    resolve(result);
                }
            );
        });
    };

    // Function to search user's channels
    const searchUserChannels = (userId, searchTerm) => {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    cc.*,
                    u.name as other_username
                    
                FROM chat_channels cc
                JOIN users u ON (
                    CASE 
                        WHEN cc.user1_id = ? THEN cc.user2_id
                        ELSE cc.user1_id
                    END = u.id
                )
                WHERE (cc.user1_id = ? OR cc.user2_id = ?)
                AND (
                    u.name LIKE ? OR
                    cc.last_msg LIKE ?
                )
                ORDER BY cc.updated_at DESC
                LIMIT 20`;

            const searchPattern = `%${searchTerm}%`;
            connection.query(
                sql,
                [userId, userId, userId, searchPattern, searchPattern],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                }
            );
        });
    };

    return {
      
        notifyChannelUpdate: async (channelId) => {
            try {
             
                const channelData = await fetchChannelDetails(channelId);
              
                channelsNamespace.to(`channel:${channelId}`).emit('channelUpdate', channelData);
            } catch (error) {
                console.error('Error notifying channel update:', error);
            }
        }
    };
}

module.exports = initializeChannelsSocket;