import React, { useState, useEffect, useRef, useContext } from 'react';
import { Clock, CheckCheck, Menu, User, LogOut, MessageSquarePlus, Search, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import AuthContext from '../../Context/AuthContext';
import { io } from 'socket.io-client';
import axios from 'axios';
import { toast } from 'react-toastify';

function getInitials(name) {
  return name?.split(' ')[0]?.[0] || '?';
}

function getAvatarColor(name) {
  const colors = [
    'bg-blue-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-purple-500',
    'bg-sky-500',
  ];
  const index = (name?.length || 0) % colors.length;
  return colors[index];
}

function formatLastMessageTime(timestamp) {
  if (!timestamp) return '';

  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (hours < 24) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (hours < 48) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString();
  }
}

function SideBar({ onUserSelect, activeChannel }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [channels, setChannels] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const menuRef = useRef(null);
  const modalRef = useRef(null);
  const socketRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const userSearchTimeoutRef = useRef(null);
  const { authState, logout } = useContext(AuthContext);



  const fetchUsers = async (searchString = '') => {
    setIsLoadingUsers(true);


    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `http://localhost:3000/search/users?search=${searchString}`,
      headers: {
        'Authorization' : `Bearer ${authState.accessToken}`
      }

    };

    axios.request(config)
      .then((response) => {
        const data = response.data;
        console.log(users, "users")
        setUsers(data.filter(user => user.id !== authState.userDetails.id));
      })
      .catch((error) => {
        console.log(error, "err")

        toast.error('Failed to fetch users');
        setError('Failed to fetch users');

      }).finally(() => {
        console.log("finally")

        setIsLoadingUsers(false);
      });



  };

  useEffect(() => {
    if (userSearchTimeoutRef.current) {
      clearTimeout(userSearchTimeoutRef.current);
    }

    if (!isNewChatOpen) return;

    userSearchTimeoutRef.current = setTimeout(() => {
      fetchUsers(userSearchTerm);
    }, 300);

    return () => {
      if (userSearchTimeoutRef.current) {
        clearTimeout(userSearchTimeoutRef.current);
      }
    };
  }, [userSearchTerm, isNewChatOpen]);

  useEffect(() => {
    if (isNewChatOpen) {
      fetchUsers();
    }
  }, [isNewChatOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsNewChatOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleUserSelect = (user) => {
    console.log(user.id,"selected")
    onUserSelect({
      id: user.id,
      name: user.name,
      chatChannel: `chat_${Math.min(authState.userDetails.id, user.id)}_${Math.max(authState.userDetails.id, user.id)}`
    });
    setIsNewChatOpen(false);
    setUserSearchTerm('');
  };
  // Initialize socket connection
  useEffect(() => {
    socketRef.current = io('http://localhost:3000/channels', {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      extraHeaders: {
        'authorization': `Bearer ${authState.accessToken}` // Add your authorization header
      }
    });

    // Set up event listeners
    const setupSocketListeners = () => {
      // Connect event
      socketRef.current.on('connect', () => {
        console.log('Connected to channels socket');
        // Emit userJoined event after successful connection
        socketRef.current.emit('userJoined', authState.userDetails.id);
      });

      // Initial channels load
      socketRef.current.on('initialChannels', (data) => {
        console.log('Received initial channels:', data);
        setChannels(data);
        setIsLoading(false);
      });

      // Channel updates
      socketRef.current.on('channelsUpdate', (data) => {
        console.log('Received channels update:', data);
        setChannels(data);
        setIsLoading(false);
      });

      // Search results
      socketRef.current.on('searchResults', (data) => {
        console.log('Received search results:', data);
        setChannels(data);
        setIsLoading(false);
      });

      // Error handling
      socketRef.current.on('errorFetchingChannels', (errorMsg) => {
        console.error('Error fetching channels:', errorMsg);
        setError(errorMsg);
        setIsLoading(false);
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setError('Failed to connect to chat server');
        setIsLoading(false);
      });

      // Disconnect event
      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from channels socket');
      });
    };

    setupSocketListeners();

    // Cleanup
    return () => {
      if (socketRef.current) {
        socketRef.current.off('connect');
        socketRef.current.off('initialChannels');
        socketRef.current.off('channelsUpdate');
        socketRef.current.off('searchResults');
        socketRef.current.off('errorFetchingChannels');
        socketRef.current.off('connect_error');
        socketRef.current.off('disconnect');
        socketRef.current.disconnect();
      }
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [authState.userDetails.id]);

  // Handle search with debouncing
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!socketRef.current?.connected) {
      return;
    }

    setIsLoading(true);

    searchTimeoutRef.current = setTimeout(() => {
      if (searchTerm) {
        console.log('Emitting search request:', searchTerm);
        socketRef.current.emit('searchChannels', {
          userId: authState.userDetails.id,
          searchTerm
        });
      } else {
        console.log('Fetching all channels');
        socketRef.current.emit('fetchChannels', authState.userDetails.id);
      }
    }, 300); // 300ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, authState.userDetails.id]);

  // Click outside handler for menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Retry connection function
  const retryConnection = () => {
    setIsLoading(true);
    setError(null);
    if (socketRef.current) {
      socketRef.current.connect();
    }
  };

  if (error) {
    return (
      <div className="w-full md:w-80 bg-white p-4 flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={retryConnection}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="w-full md:w-80  bg-gradient-to-b from-blue-50 to-white h-full overflow-y-auto border-r border-gray-300 md:rounded-r-2xl shadow-md">
      <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-500 flex justify-between items-center relative">
        <h2 className="text-xl font-bold text-white">Messages</h2>

        <div className="flex items-center space-x-2">
          <button
            className="p-2 hover:bg-blue-700 rounded-lg transition-colors duration-150"
            onClick={() => setIsNewChatOpen(true)}
          >
            <MessageSquarePlus className="w-6 h-6 text-white" />
          </button>

          <div className="relative" ref={menuRef}>
            <button
              className="p-2 hover:bg-blue-700 rounded-lg transition-colors duration-150"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-6 h-6 text-white" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-1">
                  <Link
                    to={`/profile/${authState.userDetails.id}`}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 w-full text-left"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Chat Modal */}
      {isNewChatOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            ref={modalRef}
            className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">New Chat</h3>
            </div>

            <div className="p-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users..."
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                />
                <Search className="w-5 h-5 text-gray-400 absolute right-3 top-2.5" />
              </div>

              <div className="mt-4 max-h-96 overflow-y-auto">
                {isLoadingUsers ? (
                  <div className="flex justify-center items-center p-4">
                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                  </div>
                ) : users.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">
                    {userSearchTerm ? 'No users found' : 'No users available'}
                  </p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {users.map((user,index) => (
                      <li
                        key={index}
                        onClick={() => handleUserSelect(user)}
                        className="p-3 hover:bg-blue-50 cursor-pointer flex items-center justify-between space-x-3"
                      >

                        <div className='flex justify-center items-center gap-2'>
                        <div className={`w-10 h-10 flex rounded-full items-center justify-center text-xl shadow-md font-semibold text-white ${getAvatarColor(user.username)}`}>
                          {getInitials(user.name)}
          
                        </div>
                        <span className="flex-1 text-gray-900">
                          {user.name}
                          <p className='text-gray-400 text-sm'>{user.institution}</p>
                          
                          </span>
                        
                        </div>
                        <div className='bg-green-400 px-3 py-1 rounded-full text-black shadow-md'>
                          {user.role}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-4">
        <input
          type="text"
          placeholder="Search messages..."
          className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : channels.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          {searchTerm ? 'No matches found' : 'No messages yet'}
        </div>
      ) : (
        <ul className="divide-y divide-blue-100">
          {channels.map((channel) => (
            <li
              key={channel.chat_channel}
              onClick={() => onUserSelect({
                id: channel.other_user_id,
                name: channel.other_username,
                chatChannel: channel.chat_channel
              })}
              className={`hover:bg-blue-50/80 transition-all duration-150 cursor-pointer group 
                ${activeChannel === channel.chat_channel ? 'bg-blue-100' : ''}`}
            >
              <div className="p-4 flex items-start space-x-3">
                <div className="relative flex-shrink-0">
                  {channel.profile_picture ? (
                    <img
                      src={channel.profile_picture}
                      alt={channel.other_username}
                      className="w-12 h-12 rounded-full object-cover shadow-md transform group-hover:scale-105 transition-transform duration-150"
                    />
                  ) : (
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold text-white shadow-md transform group-hover:scale-105 transition-transform duration-150 ${getAvatarColor(channel.other_username)}`}>
                      {getInitials(channel.other_username)}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-blue-900 truncate group-hover:text-blue-700">
                      {channel.other_username}
                    </h3>
                    <span className="text-xs text-blue-600 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatLastMessageTime(channel.updated_at)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-blue-700 truncate max-w-[180px] group-hover:text-blue-600">
                      {channel.last_msg}
                    </p>
                    {channel.unread_count > 0 ? (
                      <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                        {channel.unread_count}
                      </span>
                    ) : channel.sender === authState.userDetails.id ? (
                      <CheckCheck className="w-4 h-4 text-blue-500" />
                    ) : null}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SideBar;