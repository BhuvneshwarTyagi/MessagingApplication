import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './AppRoutes';


function App() {
  const [selectedUser, setSelectedUser] = useState(null);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  return (
    <BrowserRouter>
      <AppRoutes selectedUser={selectedUser} onUserSelect={handleUserSelect} />
    </BrowserRouter>
  );
}

export default App;
