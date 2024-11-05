import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.jpg';
import loginImage from '../assets/login_page.png';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from "../Context/AuthContext";
function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        let data = JSON.stringify({
            "email": email,
            "password": password
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'http://localhost:3000/login',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };

        axios.request(config)
            .then((response) => {
                console.log(response.data)
                login(response.data.user, response.data.tokens);

                navigate('/chat')
            })
            .catch((error) => {
                console.log(error)
                toast.error(error.response.data.error);
            });


    };

    return (
        <div className="bg-gradient-to-b from-blue-400 via-blue-300 to-blue-200 w-screen h-screen flex flex-col gap-8 justify-center items-center text-base">
            <div className="bg-gradient-to-br from-indigo-400 to-blue-400 bg-opacity-60 h-2/3 w-1/3 rounded-3xl shadow-lg shadow-blue-100">
                <div className="w-full h-28 bg-indigo-900 px-6 flex justify-between rounded-t-3xl">
                    <div className="relative py-4 text-white">
                        <p className="text-xl font-medium leading-tight pb-1">Welcome Back!</p>
                        <p className="pb-3">Sign in to continue</p>
                        <img src={logo} className="w-20 h-20 rounded-full absolute border-4 border-indigo-900 border-opacity-5" alt="Logo" />
                    </div>
                    <img src={loginImage} alt="Login illustration" className="h-full" />
                </div>
                <div className="mt-16 mx-6 text-lg text-white">
                    <form onSubmit={handleSubmit} className="mt-6">
                        <label htmlFor="email" className="block mb-1">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email"
                            className="bg-transparent placeholder-white w-full border border-white rounded-xl py-1 pl-2 shadow-sm shadow-primary"
                            required
                        />
                        <label htmlFor="password" className="block mt-2 mb-1">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            className="bg-transparent placeholder-white w-full border border-white rounded-xl py-1 pl-2 shadow-sm shadow-primary"
                            required
                        />
                        <label className="block">
                            <input type="checkbox" className="mt-4 mb-6 mr-2 rounded-full" />
                            Remember me
                        </label>
                        <button type="submit" className="w-full py-2 bg-indigo-500 rounded-xl shadow-md border border-indigo-500 hover:border-indigo-500 hover:bg-indigo-600">
                            <p className="text-white font-medium mx-auto">Log in</p>
                        </button>
                    </form>
                    <p className="text-lg text-black text-center py-2">
                        Don't have an account? &nbsp;
                        <Link to="/signup" className="text-white hover:underline">
                            SignUp
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
