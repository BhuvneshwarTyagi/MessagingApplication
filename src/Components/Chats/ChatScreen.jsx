import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import ChatWindow from './ChatWindow';
import SideBar from './SideBar';
import EmptyChatState from './BaseComponent';

const ChatScreen = ({selectedUser, onUserSelect,currentUserId}) => {
  const [isMobileView, setIsMobileView] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const handleUserSelect = (user) => {
    onUserSelect(user);
    setShowChat(true);
  };

  const handleBackToSidebar = () => {
    setShowChat(false);
  };

  return (
    <div className="flex h-screen w-screen">
      {/* Sidebar - Full width on mobile when chat is not shown */}
      <div
        className={`
          ${showChat ? 'hidden md:block' : 'w-full md:w-auto'} 
         
        `}
      >
        <div className='h-full w-full md:w-fit'>
        <SideBar 
          onUserSelect={handleUserSelect}
          activeChannel={
            selectedUser &&
            `chat_channel_${Math.min(currentUserId, selectedUser.id)}_${Math.max(
              currentUserId,
              selectedUser.id
            )}`
          }
        />
        </div>
      </div>

      {/* Chat Window - Full width on mobile when shown */}
      {selectedUser && (
        <div 
          className={`
            ${!showChat ? 'hidden md:flex' : 'flex'} 
            flex-col w-full h-screen
          `}
        >
          {/* Mobile Back Button */}
          <div className="md:hidden flex items-center p-4 border-b">
            <button
              onClick={handleBackToSidebar}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Chats
            </button>
          </div>

          {/* Chat Window */}
          <div className="flex-1 overflow-hidden">
            <ChatWindow user={selectedUser} />
          </div>
        </div>
      )}

      {/* Background Image - Only shown when no chat is selected on larger screens */}
      {!selectedUser && (
        <EmptyChatState onUserSelect={onUserSelect}/>
      )}
    </div>
  );
};

export default ChatScreen;