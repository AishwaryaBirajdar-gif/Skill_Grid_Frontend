import React, { useState } from 'react'; // ✅ Ensure both React and { useState } are here
import { Mail, Lock, ArrowLeft, Grid } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from "../api/axiosInstance";

// Reusing the Button component logic for consistent styling
const Button = ({ children, onClick, variant = 'primary', className = '', type = 'button' }) => {
    let baseStyles = 'px-7 py-3 font-semibold rounded-full transition duration-300 shadow-xl flex items-center justify-center whitespace-nowrap text-lg';
    
    if (variant === 'primary') {
        baseStyles += ' bg-gradient-to-r from-teal-500 to-indigo-600 text-white hover:from-teal-600 hover:to-indigo-700 focus:ring-4 focus:ring-teal-300/60 transform hover:scale-[1.05] active:scale-[1.02] shadow-teal-500/40';
    } else if (variant === 'secondary') {
        baseStyles += ' bg-transparent text-white border border-indigo-400 hover:border-teal-400 hover:bg-white/10 focus:ring-4 focus:ring-indigo-300/50 transform hover:scale-[1.02]';
    } else if (variant === 'ghost') {
        baseStyles += ' text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 shadow-none';
    }

    return (
        <button type={type} className={`${baseStyles} ${className}`} onClick={onClick}>
            {children}
        </button>
    );
};

const InputField = ({ id, label, type = 'text', icon: Icon, placeholder, value, onChange }) => (
    <div className="mb-6">
        <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-2">
            {label}
        </label>
        <div className="relative">
            {Icon && (
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon className="h-5 w-5 text-indigo-400" aria-hidden="true" />
                </div>
            )}
            <input
                id={id}
                name={id}
                type={type}
                placeholder={placeholder}
                required
                value={value}
                onChange={onChange}
                className="block w-full pl-10 pr-4 py-3 border border-gray-700 rounded-lg text-white bg-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150"
            />
        </div>
    </div>
);

const Login = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await axios.post("/auth/login", {
                email,
                password,
            });

            const data = response.data;
            const userId = data.id || data._id || data.userId;

            if (!userId) {
                alert("Login Error: User ID not found in server response.");
                return;
            }

            localStorage.clear();
            localStorage.setItem("token", data.token); 
            localStorage.setItem("userId", userId); 
            localStorage.setItem("skillgrid_userId", userId); 
            
            // ✅ Fix: Capture actual name
            const displayName = data.name || data.fullname || "User";
            localStorage.setItem("userName", displayName); 

            localStorage.setItem("userRole", data.role);
            localStorage.setItem("skillgrid_token", data.token);
            localStorage.setItem("skillgrid_email", data.email || email);

            if (onLoginSuccess) {
                onLoginSuccess(data);
            }

            navigate("/dashboard");

        } catch (error) {
            console.error("Login Error:", error);
            const errorMsg = error.response?.data?.message || "Login failed";
            alert(errorMsg);
        }
    };
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 overflow-hidden relative">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] z-0"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 to-black/40 z-0"></div>

            <button 
                onClick={() => navigate('/')} 
                className="absolute top-8 left-8 text-gray-300 hover:text-teal-400 transition duration-300 flex items-center space-x-2 font-medium z-10"
            >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Home</span>
            </button>

            <div className="w-full max-w-lg p-8 md:p-12 bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-3xl z-10 border border-gray-700">
                <div className="text-center mb-10">
                    <Grid className="w-10 h-10 text-teal-400 mx-auto mb-3" />
                    <h2 className="text-4xl font-extrabold text-white mb-2">Welcome Back</h2>
                    <p className="text-gray-400 text-lg">Log in to your SkillGrid account</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <InputField
                        id="email"
                        label="Email Address"
                        type="email"
                        icon={Mail}
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    
                    <InputField
                        id="password"
                        label="Password"
                        type="password"
                        icon={Lock}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <Button 
                        type="submit" 
                        variant="primary" 
                        className="w-full mt-6 py-3.5 text-xl shadow-teal-500/40"
                    >
                        Sign In to SkillGrid
                    </Button>
                </form>

                <p className="mt-8 text-center text-gray-400">
                    Don't have an account yet?{' '}
                    <button onClick={() => navigate('/signup')} className="font-semibold text-teal-400 hover:text-indigo-400 transition duration-150">
                        Join SkillGrid
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login;