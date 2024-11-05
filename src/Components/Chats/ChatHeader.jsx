import { useContext, useEffect, useRef, useState } from 'react';
import { Phone, Video, MoreVertical } from 'lucide-react';
import io from 'socket.io-client';
import AuthContext from './../../Context/AuthContext';

function ChatHeader({ user }) {
  const [status, setStatus] = useState(user?.isOnline ? 'Online' : 'Offline');
  const { authState } = useContext(AuthContext);
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
    let isComponentMounted = true;

    const initializeSocket = () => {
      // Clean up existing socket if it exists
      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      // Only initialize if we have both user.id and authState.userDetails.id
      if (!user?.id || !authState?.userDetails?.id) {
        return;
      }

      socketRef.current = io('http://localhost:3000/status', {
        query: {
          by: authState.userDetails.id,
        },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      const handleStatusUpdate = (data) => {
        if (!isComponentMounted) return;
        if (data.userId === user.id) {
          setStatus(data.status);
        }
      };

      const handleStatusChecked = (data) => {
        if (!isComponentMounted) return;
        setStatus(data.status === 'Online' ? 'Online' : 'Offline');
      };

      const handleError = (message) => {
        if (!isComponentMounted) return;
        console.error("Error from server:", message);
        setStatus('Offline');
      };

      const handleConnect = () => {
        if (!isComponentMounted) return;
        console.log('Socket connected');
        socketRef.current.emit('check', user.id);
        // Clear any pending reconnection timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      const handleDisconnect = () => {
        if (!isComponentMounted) return;
        console.log('Socket disconnected');
        setStatus('Offline');
        
        // Attempt to reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          if (isComponentMounted) {
            initializeSocket();
          }
        }, 5000);
      };

      // Add event listeners
      socketRef.current.on('connect', handleConnect);
      socketRef.current.on('disconnect', handleDisconnect);
      socketRef.current.on('statusUpdate', handleStatusUpdate);
      socketRef.current.on('statusChecked', handleStatusChecked);
      socketRef.current.on('error', handleError);

      // Initial status check
      socketRef.current.emit('check', user.id);
    };

    initializeSocket();

    // Cleanup function
    return () => {
      isComponentMounted = false;
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user, authState?.userDetails?.id]); 

  return (
    <div className="border-b border-blue-100 bg-white backdrop-blur-lg bg-opacity-90 p-4 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold text-white bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
              {user?.name?.[0]}
            </div>
            <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${status === 'Online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </div>
          <div>
            <h3 className="font-bold text-gray-800">{user?.name}</h3>
            <span className={`text-sm ${status === 'Online' ? 'text-green-500' : 'text-red-500'} flex items-center`}>
              <span className={`w-2 h-2 rounded-full ${status === 'Online' ? 'bg-green-500' : 'bg-red-500'} mr-2 animate-pulse`}></span>
              {status === 'Online' ? 'Active now' : 'Offline'}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-3 hover:bg-blue-50 rounded-xl transition-all duration-200 group">
            <Phone className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
          </button>
          <button className="p-3 hover:bg-blue-50 rounded-xl transition-all duration-200 group">
            <Video className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
          </button>
          <button className="p-3 hover:bg-blue-50 rounded-xl transition-all duration-200 group">
            <MoreVertical className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatHeader;