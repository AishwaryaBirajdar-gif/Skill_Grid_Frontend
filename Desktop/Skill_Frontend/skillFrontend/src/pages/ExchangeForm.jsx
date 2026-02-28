import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { Send, Loader2, Zap, MessageSquare, Briefcase, BookOpen } from 'lucide-react';

const ExchangeForm = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const selectedSkill = location.state?.skill || {
        id: 'manual-id',
        name: 'General Skill',
        postedBy: { name: 'User', id: 'unknown' },
        exchangePreferences: 'Not specified'
    };

    const currentUserId = localStorage.getItem('userId') || localStorage.getItem('skillgrid_userId');
    // ✅ Grab current user's name with a fallback
    const currentUserName = localStorage.getItem('userName') || "Me"; 

    const [formState, setFormState] = useState({
        message: `Hello, I am interested in your ${selectedSkill.name} skill!`,
        proposedExchangeDetails: '',
    });
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentUserId) {
            setError("Please log in to send a request.");
            return;
        }

        setIsSubmitting(true);
        setMessage('');
        setError(null);

        // ✅ Robust Payload: Captures names from multiple possible locations 
        // to prevent "Unknown User"
        const exchangePayload = {
            senderId: currentUserId,
            senderName: currentUserName,
            receiverId: selectedSkill.userId || selectedSkill.postedBy?.id || selectedSkill.postedBy?._id,
            receiverName: selectedSkill.userName || selectedSkill.postedBy?.name || selectedSkill.author || 'Skill Member',
            skillRequested: selectedSkill.name,
            skillOffered: formState.proposedExchangeDetails,
            message: formState.message,
            status: 'PENDING'
        };

        try {
            // ✅ This sends the request to your MongoDB via Spring Boot
            await axiosInstance.post('/requests/send', exchangePayload);
            
            setMessage(`Success! Your request has been sent to ${exchangePayload.receiverName}.`);
            
            // Redirect so the user sees the updated "Sent" list
            setTimeout(() => navigate('/my-requests'), 2000);
        } catch (err) {
            setError('Failed to send request. Make sure your Backend is running.');
            console.error("Database Error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8 flex justify-center">
            <div className="w-full max-w-3xl bg-white shadow-2xl rounded-xl border border-gray-200">
                
                {/* Header */}
                <div className="p-6 sm:p-8 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-xl">
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center">
                        <Zap className="w-8 h-8 text-indigo-600 mr-3" />
                        Initiate Skill Exchange
                    </h1>
                    <p className="mt-1 text-gray-500">
                        Requesting **{selectedSkill.name}** from **{selectedSkill.userName || selectedSkill.postedBy?.name || 'User'}**
                    </p>
                </div>

                {/* Status Messages */}
                {message && (
                    <div className="p-4 mx-6 mt-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded-lg animate-pulse">
                        {message}
                    </div>
                )}
                {error && (
                    <div className="p-4 mx-6 mt-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Skill Summary Card */}
                <div className="p-6 mx-6 mt-6 bg-white border border-indigo-200 rounded-lg shadow-inner">
                    <div className="flex items-center text-sm mb-2 font-semibold">
                        <BookOpen className="w-4 h-4 mr-2 text-indigo-500" />
                        Skill: <span className="ml-2 font-bold text-indigo-800">{selectedSkill.name}</span>
                    </div>
                    <div className="flex items-center text-sm">
                        <Briefcase className="w-4 h-4 mr-2 text-indigo-500" />
                        Preferences: <span className="ml-2 text-gray-600">{selectedSkill.exchangePreferences || "No preferences listed"}</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 sm:p-8">
                    <div className="mb-6">
                        <Label htmlFor="message" icon={MessageSquare} text="Personalized Request Message" />
                        <textarea
                            id="message"
                            name="message"
                            rows="4"
                            value={formState.message}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            placeholder="Introduce yourself and explain why you'd like to learn this skill..."
                        />
                    </div>

                    <div className="mb-6">
                        <Label htmlFor="proposedExchangeDetails" icon={Briefcase} text="What skill will you give in return?" />
                        <textarea
                            id="proposedExchangeDetails"
                            name="proposedExchangeDetails"
                            rows="3"
                            value={formState.proposedExchangeDetails}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            placeholder="e.g., I am an expert in Python and can teach you data basics..."
                        />
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full flex items-center justify-center px-6 py-4 border border-transparent text-lg font-bold rounded-xl shadow-lg transition-all duration-200 ${
                                isSubmitting 
                                ? 'bg-indigo-400 text-white cursor-not-allowed' 
                                : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-1 active:translate-y-0'
                            }`}
                        >
                            {isSubmitting ? <Loader2 className="w-6 h-6 mr-2 animate-spin" /> : <Send className="w-6 h-6 mr-2" />}
                            {isSubmitting ? 'Processing Request...' : 'Confirm & Send Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Label = ({ htmlFor, icon: Icon, text }) => (
    <label htmlFor={htmlFor} className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
        {Icon && <Icon className="w-4 h-4 mr-2 text-indigo-500" />}
        {text}
    </label>
);

export default ExchangeForm;