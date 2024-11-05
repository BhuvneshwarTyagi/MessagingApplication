import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

function UserProfile() {
  const { userId } = useParams();

  const [userData, setUserData] = useState({
    name: "John Doe",
    email: "johndoe@example.com",
    phone: "123-456-7890",
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({ ...prevData, [name]: value }));
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    setIsEditing(false);
    console.log("Saved data:", userData);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-green-100">
      <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-green-800 text-center mb-4">User Profile</h1>
        {/* <p className="text-gray-500 text-center mb-8 font-medium">User ID: {userId}</p> */}

        <div className="space-y-6">
          <div>
            <label className="block text-green-800 font-medium mb-1">Name</label>
            <div className="flex items-center bg-gray-100 rounded-md p-2">
              <input
                type="text"
                name="name"
                value={userData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full bg-transparent outline-none text-gray-700 ${
                  isEditing ? 'border-b-2 border-green-500' : ''
                }`}
                placeholder="Enter your name"
              />
            </div>
          </div>

          <div>
            <label className="block text-green-800 font-medium mb-1">Email</label>
            <div className="flex items-center bg-gray-100 rounded-md p-2">
              <input
                type="email"
                name="email"
                value={userData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full bg-transparent outline-none text-gray-700 ${
                  isEditing ? 'border-b-2 border-green-500' : ''
                }`}
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label className="block text-green-800 font-medium mb-1">Phone Number</label>
            <div className="flex items-center bg-gray-100 rounded-md p-2">
              <input
                type="tel"
                name="phone"
                value={userData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full bg-transparent outline-none text-gray-700 ${
                  isEditing ? 'border-b-2 border-green-500' : ''
                }`}
                placeholder="Enter your phone number"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-8 space-x-4">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600 transition duration-200"
              >
                Save
              </button>
              <button
                onClick={toggleEditMode}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-400 transition duration-200"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={toggleEditMode}
              className="px-6 py-2 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600 transition duration-200"
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
