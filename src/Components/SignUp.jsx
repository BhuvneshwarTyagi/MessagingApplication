import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import logo from './../assets/logo.jpg'

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    institution: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'password') {
      // Calculate password strength
      let strength = 0;
      if (value.length >= 8) strength++;
      if (value.match(/[A-Z]/)) strength++;
      if (value.match(/[0-9]/)) strength++;
      if (value.match(/[^A-Za-z0-9]/)) strength++;
      setPasswordStrength(strength);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/signup', formData, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      toast.success("Sign up Successful!", {
        icon: <CheckCircle2 className="text-green-500" />
      });
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed", {
        icon: <AlertCircle className="text-red-500" />
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 via-blue-400 to-blue-300 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Card Container */}
        <div className="bg-white bg-opacity-10 rounded-3xl shadow-xl overflow-hidden transform hover:scale-[1.02] transition-all duration-300">
          {/* Header */}
          <div className="bg-indigo-900 p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 to-blue-800"></div>
            <div className="relative z-10 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Create Account</h1>
                <p className="text-blue-200">Join our community today</p>
              </div>
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                <img src={logo} alt="logo" className="w-16 h-16 rounded-full object-cover" />
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl bg-white border border-white border-opacity-20 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-black placeholder-gray-500 transition-all duration-300"
                  placeholder="Enter your name"
                  required
                />
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl bg-white border border-white border-opacity-20 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-black placeholder-gray-500 transition-all duration-300"
                  placeholder="Enter your email"
                  required
                />
              </div>

              {/* Phone Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl bg-white border border-white border-opacity-20 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-black placeholder-gray-500 transition-all duration-300"
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl bg-white  border border-white border-opacity-20 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-grey-500 transition-all duration-300"
                  required
                >
                  <option value="" className="text-gray-900">Select a role</option>
                  <option value="teacher" className="text-gray-900">Teacher</option>
                  <option value="student" className="text-gray-900">Student</option>
                  <option value="institute" className="text-gray-900">Institute</option>
                </select>
              </div>

              {/* Institution Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Institution</label>
                <input
                  type="text"
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl bg-white border border-white border-opacity-20 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-black placeholder-gray-500 transition-all duration-300"
                  placeholder="Enter your institution"
                  required
                />
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl bg-white border border-white border-opacity-20 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-whblacklaceholder-gray-305 transition-all duration-300"
                    placeholder="Create a password"
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
                {/* Password Strength Indicator */}
                <div className="flex gap-1 mt-2">
                  {[...Array(4)].map((_, index) => (
                    <div
                      key={index}
                      className={`h-1 w-full rounded-full transition-all duration-300 ${
                        index < passwordStrength
                          ? passwordStrength === 1
                            ? 'bg-red-500'
                            : passwordStrength === 2
                            ? 'bg-yellow-500'
                            : passwordStrength === 3
                            ? 'bg-blue-500'
                            : 'bg-green-500'
                          : 'bg-gray-300'
                      }`}
                    ></div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Login Link */}
            <p className="mt-6 text-center">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-100 hover:underline transition-all duration-300"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;