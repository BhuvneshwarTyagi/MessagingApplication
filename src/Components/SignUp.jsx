import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.jpg';
import axios from 'axios';
import { toast } from 'react-toastify';

function SignUp() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState('');
    const [institution, setInstitution] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();
    const handleSubmit = (e) => {
        e.preventDefault();
       
        let data = JSON.stringify({
            "name": name,
            "email": email,
            "phone": phone,
            "role": role,
            "institution": institution,
            "password": password
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'http://localhost:3000/signup',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };

        axios.request(config)
            .then((response) => {
                toast.success("Sign up Successfull");
                navigate('/login')
            })
            .catch((error) => {
                console.log(error);
                toast.error(error.response.data.message);
            });

    };

    return (
        <div className="bg-gradient-to-b from-blue-400 via-blue-300 to-blue-200 w-screen h-fit overflow-y-auto py-6 flex flex-col justify-center items-center text-base">
            <div className="bg-gradient-to-br from-indigo-400 to-blue-400 bg-opacity-60 h-fit w-1/3 rounded-3xl shadow-lg shadow-blue-100">
                <div className="w-full h-28 bg-indigo-900 px-6 flex items-center justify-between rounded-t-3xl">
                    <div className="relative py-4 text-white">
                        <p className="text-xl font-medium leading-tight pb-1">Create an Account!</p>
                        <p className="pb-3">Fill in the details below</p>
                    </div>
                    <img src={logo} alt="logo" className="w-20 h-20 rounded-full border-4 border-indigo-900 border-opacity-5" />
                </div>

                <div className="mt-6 mx-6 text-lg">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block mb-1 text-white">Name</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                placeholder="Enter your name"
                                className="bg-white placeholder-black w-full border hover:border-blue-200 rounded-xl py-1 pl-2 shadow-sm hover:shadow-blue-200"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block mb-1 text-white">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Enter your email"
                                className="bg-white placeholder-black w-full border hover:border-blue-200 rounded-xl py-1 pl-2 shadow-sm hover:shadow-blue-200"

                            />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block mb-1 text-white">Phone Number</label>
                            <input
                                type="tel"
                                id="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                                placeholder="Enter your phone number"
                                className="bg-white placeholder-black w-full border hover:border-blue-200 rounded-xl py-1 pl-2 shadow-sm hover:shadow-blue-200"

                            />
                        </div>
                        <div className='rounded-lg'>
                            <label htmlFor="role" className="block mb-1 text-white">Role</label>
                            <select
                                id="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                required
                                className="bg-white placeholder-text w-full border hover:border-blue-200 rounded-xl py-1 pl-2 shadow-sm hovwer:shadow-blue-200"
                            >
                                <option value="" disabled>Select a role</option>
                                <option value="teacher">Teacher</option>
                                <option value="student">Student</option>
                                <option value="institute">Institute</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="institution" className="block mb-1 text-white">Institution</label>
                            <input
                                type="text"
                                id="institution"
                                value={institution}
                                onChange={(e) => setInstitution(e.target.value)}
                                required
                                placeholder="Enter your institution name"
                                className="bg-white placeholder-black w-full border hover:border-blue-200 rounded-xl py-1 pl-2 shadow-sm hover:shadow-blue-200"

                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block mb-1 text-white">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Enter password"
                                className="bg-white placeholder-black w-full border hover:border-blue-200 rounded-xl py-1 pl-2 shadow-sm hover:shadow-blue-200"

                            />
                        </div>
                        <button type="submit" className="w-full py-2 bg-indigo-500 rounded-xl shadow-md border border-indigo-500 hover:border-indigo-500 hover:bg-indigo-600">
                            <p className="text-white font-medium mx-auto">Sign up</p>
                        </button>
                    </form>
                    <p className="mt-4 cursor-pointer text-black text-center py-3">
                        Already have an account?{' '}
                        <Link to="/" className="text-white hover:text-blue-900 font-medium">
                            LogIn
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default SignUp;
