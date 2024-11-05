import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, LogIn } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from "../Context/AuthContext";
import logo from './../assets/logo.jpg'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/login', formData, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      login(response.data.user, response.data.tokens);
      navigate('/chat');
    } catch (error) {
      toast.error(error.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 via-blue-400 to-blue-300 p-6 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="bg-white bg-opacity-10 rounded-3xl shadow-xl overflow-hidden transform hover:scale-[1.02] transition-all duration-300">
          {/* Header */}
          <div className="bg-indigo-900 p-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 to-blue-800 opacity-90"></div>
            
            {/* Content */}
            <div className="relative z-10 flex justify-between items-center">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-white">Welcome Back!</h1>
                <p className="text-blue-200">Sign in to continue</p>
              </div>
              
              {/* Logo Container */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg transform hover:rotate-12 transition-transform duration-300">
                  <img src={logo} alt="logo" className="w-12 h-12 rounded-full" />
                </div>
              </div>
            </div>
            
            {/* Login Image */}
            <div className="mt-4 flex justify-center">
              <img src={logo} alt="Login illustration" className="max-h-24 object-contain" />
            </div>
          </div>

          {/* Form Section */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-lg font-medium text-white">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl bg-white  border border-white border-opacity-20 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-black placeholder-gray-500 transition-all duration-300"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-lg font-medium text-white">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl bg-white  border border-white border-opacity-20 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-black placeholder-gray-500 transition-all duration-300"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:text-blue-200 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>


              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Log in</span>
                  </>
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <p className="mt-6 text-center ">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-medium text-blue-600 hover:text-blue-100 hover:underline transition-all duration-300"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;