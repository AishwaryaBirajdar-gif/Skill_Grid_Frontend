import React, { useState } from 'react';
import { BookOpen, Tag, MessageSquare, Send, Loader2, DollarSign, Zap } from 'lucide-react';

// --- Re-using the Mock API Call function with Exponential Backoff ---
const apiCall = async (url, options = {}) => {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
        try {
            // Replace with your actual backend URL base (e.g., 'http://localhost:8080')
            const response = await fetch(`http://localhost:8181${url}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    // IMPORTANT: Include the JWT token here
                    'Authorization': `Bearer YOUR_JWT_TOKEN_HERE`, 
                    ...options.headers,
                }
            });

            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({ message: response.statusText }));
                throw new Error(`API Error: ${response.status} - ${errorBody.message || 'Unknown error'}`);
            }

            return response.json();
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

// Available skill categories for the dropdown
const SKILL_CATEGORIES = [
    'Technology & IT',
    'Languages',
    'Arts & Music',
    'Health & Fitness',
    'Academics & Tutoring',
    'Finance & Business',
    'Handicrafts & DIY',
    'Other'
];

// Types of listings
const LISTING_TYPES = [
    { value: 'OFFERING', label: 'Offering a Skill (I can teach)' },
    { value: 'SEEKING', label: 'Seeking a Skill (I want to learn)' },
];


const SkillForm = () => {
    // Initial state matching fields we expect in the Skill DTO/Model
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: SKILL_CATEGORIES[0], 
        listingType: LISTING_TYPES[0].value,
        exchangePreferences: 'Barter for language lesson or payment equivalent.', // Example field
    });
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage('');
        setError(null);

        // NOTE: The user ID is usually extracted from the JWT token on the backend, 
        // but including a placeholder for demonstration purposes.
        const skillPayload = {
            ...formData,
            // Add current user ID (for demo, replace with actual context value)
            providerId: 'user-123', 
        };

        try {
            // Calling the POST /api/skills endpoint
            // NOTE: Using a mock since the real API call would fail without the running backend.
            // const newSkill = await apiCall('/api/skills', {
            //     method: 'POST',
            //     body: JSON.stringify(skillPayload)
            // });

            // --- MOCK POST SIMULATION ---
            await new Promise(resolve => setTimeout(resolve, 2000));
            // Simulate successful response with a generated ID
            const newSkill = { ...skillPayload, id: 'skill-' + Date.now() }; 
            // ---------------------------

            setMessage(`Success! Your skill listing "${newSkill.name}" (ID: ${newSkill.id}) has been posted.`);
            
            // Reset form after successful submission
            setFormData({
                name: '',
                description: '',
                category: SKILL_CATEGORIES[0], 
                listingType: LISTING_TYPES[0].value,
                exchangePreferences: 'Barter for language lesson or payment equivalent.',
            });

        } catch (err) {
            setError('Failed to post skill. Please check the network or server logs.');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8 flex justify-center">
            <div className="w-full max-w-4xl bg-white shadow-2xl rounded-xl border border-gray-200">
                
                {/* Header */}
                <div className="p-6 sm:p-8 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center">
                        <Zap className="w-8 h-8 text-indigo-600 mr-3" />
                        Create New Skill Listing
                    </h1>
                    <p className="mt-1 text-gray-500">
                        List a skill you can offer or one you are actively seeking.
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

                {/* Skill Form */}
                <form onSubmit={handleSubmit} className="p-6 sm:p-8">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Skill Name */}
                        <div className="col-span-1">
                            <Label htmlFor="name" icon={BookOpen} text="Skill Title" />
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="E.g., Conversational Spanish, Advanced React Hooks"
                            />
                        </div>

                        {/* Listing Type (Offering/Seeking) */}
                        <div className="col-span-1">
                            <Label htmlFor="listingType" icon={Zap} text="I Am" />
                            <select
                                id="listingType"
                                name="listingType"
                                value={formData.listingType}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                            >
                                {LISTING_TYPES.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Category */}
                        <div className="col-span-1">
                            <Label htmlFor="category" icon={Tag} text="Category" />
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                            >
                                {SKILL_CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Exchange Preferences */}
                        <div className="col-span-1">
                            <Label htmlFor="exchangePreferences" icon={DollarSign} text="Exchange Preferences" />
                            <input
                                type="text"
                                id="exchangePreferences"
                                name="exchangePreferences"
                                value={formData.exchangePreferences}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="E.g., Seeking equivalent skill or hourly rate."
                            />
                        </div>
                    </div>
                    
                    {/* Skill Description */}
                    <div className="mt-6">
                        <Label htmlFor="description" icon={MessageSquare} text="Detailed Description" />
                        <textarea
                            id="description"
                            name="description"
                            rows="5"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            maxLength="1000"
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Provide details about the level, time commitment, and what you expect from the exchange."
                        />
                        <p className="mt-1 text-xs text-gray-400">Max 1000 characters.</p>
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
                            {isSubmitting ? 'Posting Skill...' : 'Post Skill Listing'}
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

export default SkillForm;