import React, { useState } from 'react';
import { Mail, Lock, ArrowLeft, Grid, User, Shield, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from "../api/axiosInstance";

// Reusing the Button component logic for consistent styling
const Button = ({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false, isLoading = false }) => {
    let baseStyles = 'px-7 py-3 font-semibold rounded-full transition duration-300 shadow-xl flex items-center justify-center whitespace-nowrap text-lg';
    
    if (variant === 'primary') {
        baseStyles += ' bg-gradient-to-r from-teal-500 to-indigo-600 text-white hover:from-teal-600 hover:to-indigo-700 focus:ring-4 focus:ring-teal-300/60 transform hover:scale-[1.05] active:scale-[1.02] shadow-teal-500/40';
    } else if (disabled) {
        baseStyles = 'px-7 py-3 font-semibold rounded-full bg-gray-600 text-gray-400 cursor-not-allowed shadow-inner text-lg flex items-center justify-center';
    }

    return (
        <button type={type} className={`${baseStyles} ${className}`} onClick={onClick} disabled={disabled}>
            {isLoading ? <Loader2 className="animate-spin mr-2" /> : children}
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
        role: "USER", 
    });
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError(""); 
    };

    const handleBackClick = () => navigate('/');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

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
            const response = await axiosInstance.post("/auth/signup", {
                name,
                email,
                password,
                role
            });

            const data = response.data;
            
            // Set storage using the exact keys returned by your backend
            localStorage.setItem("token", data.token);
            localStorage.setItem("userId", data.userId); 
            localStorage.setItem("userName", data.fullname);
            localStorage.setItem("userRole", data.role);

            if (onSignupSuccess) onSignupSuccess(data);

            // ✅ REDIRECTION LOGIC
            if (data.role === "ADMIN") {
                navigate("/admin");
            } else {
                navigate("/dashboard");
            }

        } catch (err) {
            console.error("Signup Error:", err);
            const serverMessage = err.response?.data?.message || err.response?.data || "Signup failed!";
            setError(serverMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 overflow-hidden relative p-4 text-left">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] z-0"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 to-black/40 z-0"></div>

            <button 
                onClick={handleBackClick} 
                className="absolute top-8 left-8 text-gray-300 hover:text-teal-400 transition duration-300 flex items-center space-x-2 font-medium z-10"
            >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Home</span>
            </button>

            <div className="w-full max-w-lg p-8 md:p-12 bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-3xl z-10 border border-gray-700">
                <div className="text-center mb-8">
                    <Grid className="w-10 h-10 text-teal-400 mx-auto mb-3" />
                    <h2 className="text-4xl font-extrabold text-white mb-2">Create Account ✨</h2>
                    <p className="text-gray-400 text-lg">Join us today — it’s quick and easy!</p>
                </div>

                {error && (
                    <div className="bg-red-900/40 border border-red-700 text-red-300 p-3 rounded-lg mb-6 text-center text-sm font-medium transition duration-300">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <InputField id="name" label="Full Name" type="text" icon={User} placeholder="e.g. Alex Johnson" value={formData.name} onChange={handleChange} />
                    <InputField id="email" label="Email Address" type="email" icon={Mail} placeholder="e.g. alex@skillgrid.com" value={formData.email} onChange={handleChange} />
                    <InputField id="password" label="Password" type="password" icon={Lock} placeholder="Min 6 characters" value={formData.password} onChange={handleChange} />
                    <InputField id="confirmPassword" label="Confirm Password" type="password" icon={Lock} placeholder="Re-enter password" value={formData.confirmPassword} onChange={handleChange} />
                    
                    <div className="mb-6">
                        <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-2 text-left">Select Role</label>
                        <select id="role" name="role" value={formData.role} onChange={handleChange} className="block w-full pl-10 pr-4 py-3 border border-gray-700 rounded-lg text-white bg-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none">
                            <option value="USER">👤 User (Standard Member)</option>
                            <option value="ADMIN">🛠 Admin (Platform Moderator)</option>
                        </select>
                    </div>

                    <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting} className="w-full mt-6 py-3.5 text-xl">
                        {isSubmitting ? 'Creating Account...' : 'Sign Up'}
                    </Button>
                </form>

                <p className="mt-8 text-center text-gray-400">
                    Already have an account?{' '}
                    <button onClick={() => navigate('/login')} className="font-semibold text-teal-400 hover:text-indigo-400 transition duration-150">
                        Login
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Signup;