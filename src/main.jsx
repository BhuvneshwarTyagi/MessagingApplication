import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './Context/AuthContext.jsx';

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <ToastContainer />
    <div className='w-screen h-screen overflow-x-hidden'>
      <App />
    </div>
  </AuthProvider>

)
