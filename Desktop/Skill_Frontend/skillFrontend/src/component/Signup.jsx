import React, { useState } from 'react';
import { Mail, Lock, ArrowLeft, Grid, User, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from "../api/axiosInstance"; // ✅ ADDED

// Reusing the Button component logic from other files for consistent styling
const Button = ({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false }) => {
    let baseStyles = 'px-7 py-3 font-semibold rounded-full transition duration-300 shadow-xl flex items-center justify-center whitespace-nowrap text-lg';
    
    if (variant === 'primary') {
        baseStyles += ' bg-gradient-to-r from-teal-500 to-indigo-600 text-white hover:from-teal-600 hover:to-indigo-700 focus:ring-4 focus:ring-teal-300/60 transform hover:scale-[1.05] active:scale-[1.02] shadow-teal-500/40';
    } else if (variant === 'disabled' || disabled) {
        baseStyles = 'px-7 py-3 font-semibold rounded-full bg-gray-600 text-gray-400 cursor-not-allowed shadow-inner text-lg';
    }

    return (
        <button type={type} className={`${baseStyles} ${className}`} onClick={onClick} disabled={disabled}>
            {children}
        </button>
    );
};

// --- Component: InputField ---
const InputField = ({ id, label, type = 'text', icon: Icon, placeholder, value, onChange }) => (
    <div className="mb-4">
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

// --- Main Signup Component ---
const Signup = ({ onSignupSuccess }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "USER", // ✅ CHANGED TO UPPERCASE
    });
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError(""); // Clear error on new input
    };

    const handleBackClick = () => {
        navigate('/');
    };

    // ✅ UPDATED WITH REAL BACKEND CALL
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const { name, email, password, confirmPassword, role } = formData;

        if (!name || !email || !password || !confirmPassword) {
            setError("All fields are required!");
            setIsSubmitting(false);
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            setIsSubmitting(false);
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match!");
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await axiosInstance.post("/api/auth/signup", {
                name,
                email,
                password,
                role
            });

            console.log("Signup API Response:", response.data);

            // ✅ Save Session
            localStorage.setItem("skillgrid_token", response.data.token);
            localStorage.setItem("skillgrid_user", JSON.stringify(response.data));

            if (onSignupSuccess) onSignupSuccess(response.data);

            navigate("/dashboard");

        } catch (err) {
            console.error(err);
            setError(err.response?.data || "Signup failed! Try again.");
        }

        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 overflow-hidden relative p-4">
            
            {/* Background Gradient/Pattern for visual consistency */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] z-0"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 to-black/40 z-0"></div>


            {/* Back Button (Top Left) */}
            <button 
                onClick={handleBackClick} 
                className="absolute top-8 left-8 text-gray-300 hover:text-teal-400 transition duration-300 flex items-center space-x-2 font-medium z-10"
            >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Home</span>
            </button>
            

            {/* Signup Card */}
            <div 
                className="w-full max-w-lg p-8 md:p-12 bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-3xl z-10 border border-gray-700 transform transition duration-500 ease-out"
                style={{
                    opacity: 1, 
                    transform: 'translateY(0)'
                }}
            >
                
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <Grid className="w-10 h-10 text-teal-400 mx-auto mb-3" />
                    <h2 className="text-4xl font-extrabold text-white mb-2">
                        Create Account ✨
                    </h2>
                    <p className="text-gray-400 text-lg">
                        Join us today — it’s quick and easy!
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-900/40 border border-red-700 text-red-300 p-3 rounded-lg mb-6 text-center text-sm font-medium transition duration-300">
                        {error}
                    </div>
                )}

                {/* Signup Form */}
                <form onSubmit={handleSubmit}>
                    
                    <InputField
                        id="name"
                        label="Full Name"
                        type="text"
                        icon={User}
                        placeholder="e.g. Alex Johnson"
                        value={formData.name}
                        onChange={handleChange}
                    />

                    <InputField
                        id="email"
                        label="Email Address"
                        type="email"
                        icon={Mail}
                        placeholder="e.g. alex@skillgrid.com"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    
                    <InputField
                        id="password"
                        label="Password"
                        type="password"
                        icon={Lock}
                        placeholder="Enter a secure password (min 6 chars)"
                        value={formData.password}
                        onChange={handleChange}
                    />

                    <InputField
                        id="confirmPassword"
                        label="Confirm Password"
                        type="password"
                        icon={Lock}
                        placeholder="Re-enter your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                    />
                    
                    {/* Role Selection */}
                    <div className="mb-6">
                        <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-2">
                            Select Role
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Shield className="h-5 w-5 text-indigo-400" aria-hidden="true" />
                            </div>
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="block w-full pl-10 pr-4 py-3 border border-gray-700 rounded-lg text-white bg-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150 appearance-none"
                            >
                                <option value="USER">👤 User (Standard Member)</option>
                                <option value="ADMIN">🛠 Admin (Platform Moderator)</option>
                            </select>
                            {/* Custom arrow for appearance-none fix */}
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>

                    <Button 
                        type="submit" 
                        variant={isSubmitting ? 'disabled' : 'primary'}
                        className="w-full mt-6 py-3.5 text-xl shadow-teal-500/40"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : 'Sign Up'}
                    </Button>
                </form>

                {/* Footer Link */}
                <p className="mt-8 text-center text-gray-400">
                    Already have an account?{' '}
                    <button 
                        onClick={() => navigate('/login')}
                        className="font-semibold text-teal-400 hover:text-indigo-400 transition duration-150 focus:outline-none"
                    >
                        Login
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Signup;
