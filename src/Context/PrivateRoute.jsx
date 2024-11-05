// PrivateRoute.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from './AuthContext';

function PrivateRoute({ children }) {
  const { authState } = useContext(AuthContext);

  // Check if the user is authenticated
  if (!authState || !authState.userDetails) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" />;
  }

  // Render the protected component if authenticated
  return children;
}

export default PrivateRoute;
