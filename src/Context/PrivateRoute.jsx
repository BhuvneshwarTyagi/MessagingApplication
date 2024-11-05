import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from './AuthContext';

function PrivateRoute({ children }) {
  const { authState } = useContext(AuthContext);

 
  if (!authState || !authState.userDetails) {
  
    return <Navigate to="/login" />;
  }

 
  return children;
}

export default PrivateRoute;
