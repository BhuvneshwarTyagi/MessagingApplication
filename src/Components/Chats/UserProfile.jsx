import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AuthContext from '../../Context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { User, Mail, Phone, Edit2, Save, X, Building2, UserCircle, ChevronDown } from 'lucide-react';

function UserProfile() {
  const { userId } = useParams();
  const { authState } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({});
  const [role, setRole] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({ ...prevData, [name]: value }));
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    setIsEditing(false);
    let data = JSON.stringify(userData);

    let config = {
      method: 'put',
      maxBodyLength: Infinity,
      url: `http://localhost:3000/updateuser/${userId}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImJoYW51Njh0eWFnaUBnbWFpbC5jb20iLCJkZXNpZ25hdGlvbiI6IlRlYWNoZXIiLCJpYXQiOjE3MzA3ODI2ODEsImV4cCI6MTczMTM4NzQ4MX0.egDdSskLDWLclYXGTsmQ45ZgE7E9-hv2xL99Wi_6HsU'
      },
      data: data
    };

    axios.request(config)
      .then((response) => {
        toast.success('Profile updated successfully');
        isEditing(false);
      })
      .catch((error) => {
        console.log(error)
        toast.error(error.response.data.error);
      });

  };

  useEffect(() => {
    if (userId === authState.userDetails.id) {
      setUserData(authState.userDetails);
      setRole(authState.userDetails.role || "");
    } else {
      let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `http://localhost:3000/search/user?id=${userId}`,
        headers: {
          'Authorization': `Bearer ${authState.accessToken}`
        }
      };

      axios.request(config)
        .then((response) => {
          setUserData(response.data[0]);
          setRole(response.data[0].role || "");
        })
        .catch((error) => {
          toast.error(error.response.data.message);
        });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 to-blue-100 md:py-12 md:px-4 p-3">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white w-full rounded-3xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 md:px-8 md:py-10 p-4">
            <div className="flex items-center justify-between">
              {authState.userDetails.id === userId && !isEditing && (
                <button
                  onClick={toggleEditMode}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all duration-200 backdrop-blur-sm"
                >
                  <Edit2 size={18} />
                  <span className="font-medium text-large md:text-xl">Edit Profile</span>
                </button>
              )}
            </div>
            <div className="flex items-center md:gap-6 gap-3">
              <div className="md:w-28 md:h-28 w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center ring-4 ring-white/30 shadow-lg transform transition-transform duration-300 hover:scale-105">
                <span className="text-5xl text-white font-bold">
                  {userData.name?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>
              <div className="text-white w-full">
                <h2 className="text-2xl w-44 font-bold mb-1 truncate overflow-ellipsis">{userData.name || 'User Name'}</h2>
                <p className="text-blue-100 text-lg font-medium">{userData.role || 'Role'}</p>
                <p className="text-blue-200 mt-1">{userData.institution || 'Institution'}</p>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="w-full md:p-8 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Full Name Field */}
              <div className="relative group">
                <div className="flex items-center space-x-2 text-blue-600 mb-2">
                  <User size={18} className="text-blue-500" />
                  <label className="font-medium text-lg md:text-xl">Full Name</label>
                </div>
                <input
                  type="text"
                  name="name"
                  value={userData.name || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full p-3 md:p-4 bg-gray-50 rounded-xl outline-none transition-all duration-200
                    ${isEditing ? 'ring-2 ring-blue-400 hover:ring-blue-500' : 'text-gray-700'}
                    ${!isEditing && 'cursor-default'} group-hover:bg-gray-100`}
                  placeholder="Enter your name"
                />
              </div>

              {/* Email Field */}
              <div className="relative group">
                <div className="flex items-center space-x-2 text-blue-600 mb-2">
                  <Mail size={18} className="text-blue-500" />
                  <label className="font-medium text-lg md:text-xl">Email Address</label>
                </div>
                <input
                  type="email"
                  name="email"
                  value={userData.email || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full p-3 md:p-4 bg-gray-50 rounded-xl outline-none transition-all duration-200
                    ${isEditing ? 'ring-2 ring-blue-400 hover:ring-blue-500' : 'text-gray-700'}
                    ${!isEditing && 'cursor-default'} group-hover:bg-gray-100`}
                  placeholder="Enter your email"
                />
              </div>

              {/* Phone Number Field */}
              <div className="relative group">
                <div className="flex items-center space-x-2 text-blue-600 mb-2">
                  <Phone size={18} className="text-blue-500" />
                  <label className="font-medium text-lg md:text-xl">Phone Number</label>
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={userData.phone || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full p-3 md:p-4 bg-gray-50 rounded-xl outline-none transition-all duration-200
                    ${isEditing ? 'ring-2 ring-blue-400 hover:ring-blue-500' : 'text-gray-700'}
                    ${!isEditing && 'cursor-default'} group-hover:bg-gray-100`}
                  placeholder="Enter your phone number"
                />
              </div>

              {/* Institution Field */}
              <div className="relative group">
                <div className="flex items-center space-x-2 text-blue-600 mb-2">
                  <Building2 size={18} className="text-blue-500" />
                  <label className="font-medium text-lg md:text-xl">Institution</label>
                </div>
                <input
                  type="text"
                  name="institution"
                  value={userData.institution || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full p-3 md:p-4 bg-gray-50 rounded-xl outline-none transition-all duration-200
                    ${isEditing ? 'ring-2 ring-blue-400 hover:ring-blue-500' : 'text-gray-700'}
                    ${!isEditing && 'cursor-default'} group-hover:bg-gray-100`}
                  placeholder="Enter your institution"
                />
              </div>

              {/* Role Field */}
              <div className="relative group md:col-span-1 col-span-1">
                <div className="flex items-center space-x-2 text-blue-600 mb-2">
                  <UserCircle size={18} className="text-blue-500" />
                  <label className="font-medium text-lg md:text-xl">Role</label>
                </div>
                {isEditing ? (
                  <div className="relative">
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full p-3 md:p-4 bg-gray-50 rounded-xl outline-none appearance-none transition-all duration-200 ring-2 ring-blue-400 hover:ring-blue-500 cursor-pointer pr-10"
                    >
                      <option value="" disabled>Select a role</option>
                      <option value="teacher">Teacher</option>
                      <option value="student">Student</option>
                      <option value="institute">Institute</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-500" size={20} />
                  </div>
                ) : (
                  <input
                    type="text"
                    name="role"
                    value={userData.role || ''}
                    disabled
                    className="w-full p-3 md:p-4 bg-gray-50 rounded-xl outline-none text-gray-700 cursor-default group-hover:bg-gray-100"
                    placeholder="Your role"
                  />
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing ? (
              <div className="flex justify-center md:gap-6 gap-3 mt-10">
                <button
                  onClick={toggleEditMode}
                  className="flex items-center md:gap-2 md:px-8 md:py-3 px-4 py-2 border-2 border-red-400 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 font-medium"
                >
                  <X size={18} />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 md:px-8 md:py-3 px-4 py-2 border-2 border-green-500 rounded-xl text-green-600 hover:bg-green-50 transition-all duration-200 font-medium"
                >
                  <Save size={18} />
                  <span>Save Changes</span>
                </button>
              </div>
            ) : (
              authState.userDetails.id == userId && (
                <div className="flex justify-center mt-10">
                  <button
                    onClick={toggleEditMode}
                    className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Edit Profile
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
);
}

export default UserProfile;