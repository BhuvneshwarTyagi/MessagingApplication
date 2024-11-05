import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './Components/Login';
import SignUp from './Components/SignUp';
import SideBar from './Components/Chats/SideBar';
import ChatWindow from './Components/Chats/ChatWindow';
import UserProfile from './Components/Chats/UserProfile';
import bgImage from '../src/assets/bg.png';

function AppRoutes({ selectedUser, onUserSelect }) {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />

      <Route path="/signup" element={<SignUp />} />
      <Route path="/chat" element={
        <div className="flex h-screen">
          <SideBar onUserSelect={onUserSelect} />
          {selectedUser ? (
            <ChatWindow user={selectedUser} />
          ) : (
            <div
              className="h-screen w-full bg-cover bg-center"
              style={{
                backgroundImage: `url(${bgImage})`,
              }}
            />
          )}
        </div>
      } />
      <Route path="/profile/:userId" element={<UserProfile />} />
    </Routes>
  );
}

export default AppRoutes;
