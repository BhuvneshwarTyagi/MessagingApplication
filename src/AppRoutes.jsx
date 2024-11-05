// AppRoutes.jsx
import React, { useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './Components/Login';
import SignUp from './Components/SignUp';
import UserProfile from './Components/Chats/UserProfile';
import ChatScreen from './Components/Chats/ChatScreen';

import AuthContext from './Context/AuthContext';
import PrivateRoute from './Context/PrivateRoute';

function AppRoutes({ selectedUser, onUserSelect }) {
  const { authState } = useContext(AuthContext);
  const currentUserId = authState?.userDetails?.id;

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Protecting Chat and Profile routes */}
      <Route 
        path="/chat" 
        element={
          <PrivateRoute>
            <ChatScreen onUserSelect={onUserSelect} selectedUser={selectedUser} currentUserId={currentUserId} />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/profile/:userId" 
        element={
          <PrivateRoute>
            <UserProfile />
          </PrivateRoute>
        } 
      />
    </Routes>
  );
}

export default AppRoutes;
