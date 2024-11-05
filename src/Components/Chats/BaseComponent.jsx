import React, { useContext, useEffect, useRef, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Search, Loader2 } from 'lucide-react';
import axios from 'axios';
import AuthContext from '../../Context/AuthContext';

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

const EmptyChatState = ({onUserSelect}) => {
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [users, setUsers] = useState([]);
  const modalRef = useRef(null);
  const menuRef = useRef(null);
  const userSearchTimeoutRef = useRef(null);
  const { authState } = useContext(AuthContext);



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

  const handleUserSelect = (user) => {
    console.log(user.id, "selected")
    onUserSelect({
      id: user.id,
      name: user.name,
      chatChannel: `chat_${Math.min(authState.userDetails.id, user.id)}_${Math.max(authState.userDetails.id, user.id)}`
    });
    setIsNewChatOpen(false);
    setUserSearchTerm('');
  };

  return (
    <div className="flex flex-col h-screen w-full bg-gray-100">
      {/* Header */}


      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center max-w-md p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-gray-100 p-4 rounded-full">
              <MessageSquare size={48} className="text-gray-400" />
            </div>
          </div>

          {/* Text Content */}
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">
            Welcome to Messages
          </h2>
          <p className="text-gray-600 mb-6">
            Select a chat to start messaging or start a new conversation
          </p>

          {/* Start Chat Button */}
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors" onClick={() => setIsNewChatOpen(true)}>
            Start New Chat
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 p-4 text-center border-t">
        <p className="text-sm text-gray-500">
          Your messages are end-to-end encrypted
        </p>
      </div>
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
                    {users.map((user, index) => (
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
    </div>
  );
};

export default EmptyChatState;