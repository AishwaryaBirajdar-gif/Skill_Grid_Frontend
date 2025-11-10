import React, { useState } from 'react';
import { Send, Loader2, Zap, MessageSquare, Briefcase, BookOpen } from 'lucide-react';

// --- Re-using the Mock API Call function with Exponential Backoff ---
const apiCall = async (url, options = {}) => {
    // NOTE: This is a placeholder function. In a real application, 
    // you must handle JWT token inclusion in the Authorization header.
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
        try {
            // Simulate successful POST response
            if (url.includes('/api/exchanges') && options.method === 'POST') {
                const payload = JSON.parse(options.body);
                // Simulate network delay
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                const mockResponse = {
                    ...payload,
                    id: 'exchange-' + Date.now(),
                    status: 'PENDING',
                    createdAt: new Date().toISOString()
                };
                return mockResponse;
            }

            // Simulate the required GET skill detail call
            if (url.includes('/api/skills/s-101')) {
                 await new Promise(resolve => setTimeout(resolve, 500));
                 return mockTargetSkill;
            }

            throw new Error('Mock endpoint not found or unsupported method.');
        } catch (error) {
            attempt++;
            if (attempt >= maxRetries) {
                console.error(`Failed API call to ${url} after ${maxRetries} attempts.`, error);
                throw error;
            }
            const delay = Math.pow(2, attempt) * 1000;
            console.warn(`Retrying API call to ${url} in ${delay / 1000}s... (Attempt ${attempt})`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

// Mock data for the specific skill being requested (s-101 from BrowseSkills.jsx)
const mockTargetSkill = {
    id: 's-101',
    name: 'Conversational Spanish (Intermediate)',
    category: 'Languages',
    listingType: 'OFFERING',
    exchangePreferences: 'Seeking equivalent skill exchange in photography or a flat hourly rate.',
    postedBy: { name: 'Maria L.', id: 'user-maria' }
};


const ExchangeForm = () => {
    // In a real app, skillId would come from route parameters (e.g., useParams() in React Router)
    const skillId = 's-101'; 
    const requesterId = 'current-user-567'; // Mock ID for the user making the request
    const providerId = mockTargetSkill.postedBy.id; // Target user ID

    const [formState, setFormState] = useState({
        message: `Hello ${mockTargetSkill.postedBy.name}, I am very interested in your skill! I propose we meet twice a week virtually.`,
        proposedExchangeDetails: 'I can offer $25/hour or a 4-session intro to photo editing in Adobe Lightroom.',
        preferredStatus: 'PENDING'
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
        setIsSubmitting(true);
        setMessage('');
        setError(null);

        // The payload maps to the Java Exchange DTO/Model
        const exchangePayload = {
            skillId: skillId,
            requesterId: requesterId,
            providerId: providerId,
            message: formState.message,
            proposedExchangeDetails: formState.proposedExchangeDetails,
            status: formState.preferredStatus,
            // Additional fields (like skillName, providerName) are often stored 
            // in the Exchange object for easy retrieval, though often derived on the backend.
            skillName: mockTargetSkill.name, 
            providerName: mockTargetSkill.postedBy.name,
        };

        try {
            // Calling the POST /api/exchanges endpoint
            const newExchange = await apiCall('/api/exchanges', {
                method: 'POST',
                body: JSON.stringify(exchangePayload)
            });

            setMessage(`Success! Your exchange request (ID: ${newExchange.id}) has been sent to ${mockTargetSkill.postedBy.name}.`);
            
            // Optionally redirect user here
            
        } catch (err) {
            setError('Failed to send exchange request. Please check your network connection.');
            console.error(err);
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
                        Request **{mockTargetSkill.name}** from **{mockTargetSkill.postedBy.name}**.
                    </p>
                </div>

                {/* Status Messages */}
                {message && (
                    <div className="p-4 mx-6 mt-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded-lg animate-fadeIn">
                        {message}
                    </div>
                )}
                {error && (
                    <div className="p-4 mx-6 mt-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg animate-fadeIn">
                        {error}
                    </div>
                )}

                {/* Skill Summary Card */}
                <div className="p-6 mx-6 mt-6 bg-white border border-indigo-200 rounded-lg shadow-inner">
                    <div className="flex items-center text-sm mb-2 font-semibold">
                        <BookOpen className="w-4 h-4 mr-2 text-indigo-500" />
                        Skill: <span className="ml-2 font-bold text-indigo-800">{mockTargetSkill.name}</span>
                    </div>
                    <div className="flex items-center text-sm">
                        <Briefcase className="w-4 h-4 mr-2 text-indigo-500" />
                        Preferred Exchange: <span className="ml-2 text-gray-600">{mockTargetSkill.exchangePreferences}</span>
                    </div>
                </div>

                {/* Exchange Form */}
                <form onSubmit={handleSubmit} className="p-6 sm:p-8">
                    
                    {/* Message to Provider */}
                    <div className="mb-6">
                        <Label htmlFor="message" icon={MessageSquare} text="Personalized Request Message" />
                        <textarea
                            id="message"
                            name="message"
                            rows="4"
                            value={formState.message}
                            onChange={handleChange}
                            required
                            maxLength="500"
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Introduce yourself and explain why you want to learn this skill."
                        />
                        <p className="mt-1 text-xs text-gray-400">Max 500 characters.</p>
                    </div>

                    {/* Proposed Exchange Details */}
                    <div className="mb-6">
                        <Label htmlFor="proposedExchangeDetails" icon={Briefcase} text="Your Proposed Exchange / Barter Offer" />
                        <textarea
                            id="proposedExchangeDetails"
                            name="proposedExchangeDetails"
                            rows="3"
                            value={formState.proposedExchangeDetails}
                            onChange={handleChange}
                            required
                            maxLength="300"
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Detail what you are offering in return (e.g., your skill, money, time commitment)."
                        />
                        <p className="mt-1 text-xs text-gray-400">Max 300 characters.</p>
                    </div>


                    {/* Submit Button */}
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-md transition duration-200 ${
                                isSubmitting
                                    ? 'bg-indigo-400 text-white cursor-not-allowed'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                            }`}
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            ) : (
                                <Send className="w-5 h-5 mr-2" />
                            )}
                            {isSubmitting ? 'Sending Request...' : 'Submit Exchange Request'}
                        </button>
                    </div>

                </form>

            </div>
        </div>
    );
};

// Reusable Label Component
const Label = ({ htmlFor, icon: Icon, text }) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
        {Icon && <Icon className="w-4 h-4 mr-2 text-indigo-500" />}
        {text}
    </label>
);

export default ExchangeForm;