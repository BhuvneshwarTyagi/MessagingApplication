import React, { useState, useEffect, useRef, useContext } from 'react';
import { Clock, Check, CheckCheck, Menu, User, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import AuthContext from '../../Context/AuthContext';
const users = [
  { 
    id: 1, 
    name: 'Sarah Wilson',
    isOnline: true,
    lastMessage: "Hey, can we discuss the project?",
    lastMessageTime: "10:45 AM",
    seen: true
  },
  { 
    id: 2, 
    name: 'John Anderson',
    isOnline: false,
    lastMessage: "Thanks for the update!",
    lastMessageTime: "Yesterday",
    seen: true
  },
  { 
    id: 3, 
    name: 'Emma Thompson',
    isOnline: true,
    lastMessage: "I'll send the files soon",
    lastMessageTime: "2:30 PM",
    seen: false
  },
];

function getInitials(name) {
  return name.split(' ')[0][0];
}

function getAvatarColor(name) {
  const colors = [
    'bg-blue-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-purple-500',
    'bg-sky-500',
  ];
  const index = name.length % colors.length;
  return colors[index];
}

function SideBar({ onUserSelect, }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const {authState,logout} = useContext(AuthContext);

  // Close menu if clicked outside
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

  return (
    <div className="w-full md:w-80 bg-gradient-to-b from-blue-50 to-white h-full overflow-y-auto border-r border-gray-300 rounded-r-2xl shadow-md">
      <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-500 flex justify-between items-center relative">
        <h2 className="text-xl font-bold text-white">Messages</h2>
        
        <div className="relative" ref={menuRef}>
          <button 
            className="p-2 hover:bg-blue-700 rounded-lg transition-colors duration-150"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="w-6 h-6 text-white" />
          </button>

          {/* Dropdown Menu */}
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
                  onClick={() => {
                    logout();
                  }}
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
      
      <ul className="divide-y divide-blue-100">
        {users.map((user) => (
          <li
            key={user.id}
            onClick={() => onUserSelect(user)}
            className="hover:bg-blue-50/80 transition-all duration-150 cursor-pointer group"
          >
            <div className="p-4 flex items-start space-x-3">
              {/* Avatar with Online Status */}
              <div className="relative flex-shrink-0">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold text-white shadow-md transform group-hover:scale-105 transition-transform duration-150 ${getAvatarColor(user.name)}`}>
                  {getInitials(user.name)}
                </div>
                {user.isOnline && (
                  <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white bg-green-400 animate-pulse" />
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-blue-900 truncate group-hover:text-blue-700">
                    {user.name}
                  </h3>
                  <span className="text-xs text-blue-600 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {user.lastMessageTime}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm text-blue-700 truncate max-w-[180px] group-hover:text-blue-600">
                    {user.lastMessage}
                  </p>
                  {user.seen ? (
                    <CheckCheck className="w-4 h-4 text-blue-500" />
                  ) : (
                    <Check className="w-4 h-4 text-blue-400" />
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SideBar;
