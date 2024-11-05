import React, { useState, useEffect, useContext, useRef } from 'react';
import io from 'socket.io-client';
import { Send, Image as ImageIcon, Smile, Paperclip, Check, CheckCheck, Reply, X } from 'lucide-react';
import AuthContext from '../../Context/AuthContext';
import ChatHeader from './ChatHeader';
const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const Message = ({ 
  message, 
  isSent, 
  timestamp, 
  status = "sent", 
  isNew = false, 
  seenBy = [], 
  replyTo = null,
  onReplyClick,
  messageId,
  allMessages, // Pass all messages to find replied message
  onClick 
}) => {
  const getStatusIcon = () => {
    if (seenBy.length > 0) return <CheckCheck className="w-4 h-4 text-blue-400" />;
    if (status === "delivered") return <CheckCheck className="w-4 h-4" />;
    if (status === "sent") return <Check className="w-4 h-4" />;
    return null;
  };

  // Find the original message that was replied to
  const repliedMessage = replyTo ? allMessages.find(msg => msg.id === replyTo) : null;

  const time = new Date(timestamp);
  const formatAMPM = (date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${strMinutes} ${ampm}`;
  };

  return (
    <div className={`flex ${isSent ? 'justify-end' : 'justify-start'} mb-2 md:mb-4 group ${isNew ? 'animate-message-appear' : ''}`}>
      <div
        className={`max-w-[70%] ${isSent ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' : 'bg-white text-gray-800'} 
          rounded-2xl p-2 md:p-4 shadow-md hover:shadow-lg transition-all duration-300 relative
          ${isNew ? (isSent ? 'animate-slide-left' : 'animate-slide-right') : ""}`}
      >

        {repliedMessage && (
          <div 
            onClick={() => onClick(replyTo)}
            className={`mb-2 p-2 rounded-lg text-sm cursor-pointer
              ${isSent ? 'bg-blue-400/30 hover:bg-blue-400/40' : 'bg-gray-100 hover:bg-gray-200'}
              transition-colors duration-200`}
          >
            <p className="opacity-75 truncate">{repliedMessage.message}</p>
          </div>
        )}
        
        <p className="text-sm leading-relaxed">{message}</p>
        
        <div className="flex items-center justify-end space-x-2 mt-2">
          <span className={`text-xs ${isSent ? 'text-blue-100' : 'text-gray-500'}`}>
            {formatAMPM(time)}
          </span>
          {isSent && (
            <span className="text-blue-100">
              {getStatusIcon()}
            </span>
          )}
        </div>

        {/* Reply button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReplyClick(messageId, message);
          }}
          className={`absolute  top-1/2 -translate-y-1/2 p-2 rounded-full 
            opacity-0 group-hover:opacity-100 transition-opacity duration-200
            ${isSent ? 'bg-blue-200 hover:bg-blue-400 text-blue-600 hover:text-white -left-12' : 'bg-gray-200 hover:bg-gray-500  text-blue-600 hover:text-blue-100 rotate-180 -right-10'}`}
        >
          <Reply className="w-4 h-4 " />
        </button>
      </div>
    </div>
  );
};


const MessageInput = ({ onSendMessage, replyingTo, onCancelReply }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (message) {
      setIsTyping(true);
      const timeout = setTimeout(() => setIsTyping(false), 1000);
      return () => clearTimeout(timeout);
    }
  }, [message]);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
      setIsTyping(false);
    }
  };

  return (
    <div className="border-t border-blue-100 bg-white bg-opacity-90 backdrop-blur-lg px-2 py-1 md:p-4">
      {/* Reply preview */}
      {replyingTo && (
        <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg mb-2">
          <div className="flex items-center space-x-2">
            <Reply className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-600 truncate">{replyingTo.message}</span>
          </div>
          <button
            onClick={onCancelReply}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      )}
      
      {isTyping && (
        <div className="text-xs text-blue-500 mb-2 animate-fade-in">
          You are typing...
        </div>
      )}
      <div className="flex items-center space-x-2">

        <div className="flex-1 relative">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={replyingTo ? "Type your reply..." : "Type a message..."}
            className="w-full border border-blue-100 rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 placeholder-gray-400"
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-blue-50 rounded-xl transition-all duration-200">
            <Smile className="w-5 h-5 text-blue-600" />
          </button>
        </div>
        <button 
          onClick={handleSend}
          className={`p-3 ${message ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-200'} 
            rounded-xl transition-all duration-200 transform hover:scale-105 hover:rotate-12`}
        >
          <Send className={`w-5 h-5 ${message ? 'text-white' : 'text-gray-400'}`} />
        </button>
      </div>
    </div>
  );
};

function ChatWindow({ user }) {
  const [messages, setMessages] = useState([]);
  const { authState } = useContext(AuthContext);
  const currentUserId = authState.userDetails.id;
  const messagesEndRef = useRef(null);
  const messageRefs = useRef({});
  const [newMessageId, setNewMessageId] = useState(null);
  const [seenMessages, setSeenMessages] = useState(new Set());
  const [replyingTo, setReplyingTo] = useState(null);
  const chatContainerRef = useRef(null);
  
  const chatChannel = useRef(`chat_channel_${Math.min(currentUserId, user.id)}_${Math.max(currentUserId, user.id)}`);
  const socket = io(`${SERVER_URL}/chat`,{
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    extraHeaders: {
      'authorization': `Bearer ${authState.accessToken}` // Add your authorization header
    }
  });

  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        block: 'end'
      });
    }
  };

  // Scroll to specific message
  const scrollToMessage = (messageId) => {
    const messageElement = messageRefs.current[messageId];
    if (messageElement) {
      messageElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      // Highlight effect
      messageElement.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
      setTimeout(() => {
        messageElement.style.backgroundColor = '';
      }, 1500);
    }
  };

  // Auto scroll on new messages
  useEffect(() => {
    if (newMessageId) {
      scrollToBottom();
    }
  }, [newMessageId]);

  // Scroll to bottom on initial load
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom(false);
    }
  }, []);


  useEffect(() => {
    chatChannel.current = `chat_channel_${Math.min(currentUserId, user.id)}_${Math.max(currentUserId, user.id)}`;
    
    socket.emit('joinChannel', chatChannel.current);
    socket.emit('userJoined', {
      userId: currentUserId,
      chatChannel: chatChannel.current
    });
    
    setMessages([]);
    socket.emit('fetchInitialMessages', chatChannel.current);

    socket.on('initialMessages', (initialMessages) => {
      if (Array.isArray(initialMessages)) {
        setMessages(initialMessages);
        const seenMsgs = new Set(initialMessages
          .filter(msg => msg.seen_by?.includes(currentUserId))
          .map(msg => msg.id)
        );
        setSeenMessages(seenMsgs);
        
        setTimeout(() => scrollToBottom(false), 100);
      }
    });

    socket.on('receiveMessage', (data) => {
      if (data.chat_channel === chatChannel.current) {
        const newMessage = {
          id: data.message_id,
          message: data.message,
          sender_id: data.user1_id,
          created_at: data.timestamp || new Date(),
          status: "delivered",
          seen_by: [],
          reply_to: data.reply_to
        };
        
        setMessages(prevMessages => [...prevMessages, newMessage]);
        setNewMessageId(data.message_id);
        setTimeout(() => setNewMessageId(null), 1000);

        if (data.user1_id !== currentUserId && document.hasFocus()) {
          socket.emit('messageSeen', {
            chat_channel: chatChannel.current,
            message_id: data.message_id,
            user_id: currentUserId
          });
        }
      }
    });

  

    return () => {
      socket.emit('leaveChannel', chatChannel.current);
      socket.off('initialMessages');
      socket.off('receiveMessage');
      socket.off('messageSeenUpdate');
      socket.off('messagesBulkSeen');
    };
  }, [chatChannel.current, currentUserId, user]);

  const handleReply = (messageId, messageText) => {
    setReplyingTo({ id: messageId, message: messageText });
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleSendMessage = (messageText) => {
    if (!messageText.trim()) return;

    const messageData = {
      user1_id: currentUserId,
      user2_id: user.id,
      chat_channel: chatChannel.current,
      message: messageText,
      reply_to: replyingTo?.id || null
    };
    console.log(user,"msgdata");
    const check = socket.emit('sendMessage', messageData);
    setReplyingTo(null);
    console.log("check",check)
  };

  return (
    <div className="w-full md:flex-1 flex flex-col h-full bg-gradient-to-br from-blue-50 to-blue-100">
      <ChatHeader user={user} />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4" ref={chatContainerRef}>
        {messages.map((msg) => (
          <div key={msg.id} ref={el => messageRefs.current[msg.id] = el}>
            <Message
              messageId={msg.id}
              message={msg.message}
              isSent={msg.sender_id === currentUserId}
              timestamp={msg.created_at}
              status={msg.status}
              isNew={msg.id === newMessageId}
              seenBy={msg.seen_by || []}
              replyTo={msg.reply_to}
              onReplyClick={handleReply}
              allMessages={messages}
              onClick={scrollToMessage}
            />
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <MessageInput 
        onSendMessage={handleSendMessage}
        replyingTo={replyingTo}
        onCancelReply={handleCancelReply}
      />
    </div>
  );
}

export default ChatWindow;