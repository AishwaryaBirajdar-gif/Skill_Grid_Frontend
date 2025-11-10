import React, { useState, useEffect } from 'react';
import { User, Mail, MapPin, NotepadText, Save, Loader2, Edit } from 'lucide-react';

// Mock function to simulate API calls and exponential backoff
const apiCall = async (url, options = {}) => {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
        try {
            // Replace with your actual backend URL base (e.g., 'http://localhost:8080')
            const response = await fetch(`http://localhost:8080${url}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    // IMPORTANT: You must include the JWT token here, likely stored in localStorage after login
                    'Authorization': `Bearer YOUR_JWT_TOKEN_HERE`, 
                    ...options.headers,
                }
            });

            if (!response.ok) {
                // Handle 400s/500s but don't retry on client errors
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
            // Exponential backoff delay
            const delay = Math.pow(2, attempt) * 1000;
            console.warn(`Retrying API call to ${url} in ${delay / 1000}s... (Attempt ${attempt})`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

const mockUserProfile = {
    id: 'user-123',
    name: 'Alex Johnson',
    email: 'alex@skillexchange.com',
    role: 'SKILL_PROVIDER', // Or SKILL_SEEKER
    bio: 'Experienced React developer looking to exchange tutoring hours for Spanish lessons.',
    location: 'New York, USA',
};


const Profile = () => {
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState(null);

    // Placeholder for the currently authenticated user's ID.
    // In a real app, this would come from a global Auth Context after token decoding.
    const currentUserId = 'user-123'; 

    useEffect(() => {
        fetchUserProfile();
    }, []);

    // Function to fetch the user profile from the backend
    const fetchUserProfile = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Calling the GET /api/user/{id} endpoint
            // NOTE: Since the real API call would fail without the backend running, we use a mock for structure.
            // const data = await apiCall(`/api/user/${currentUserId}`);
            
            // --- MOCK FETCH SIMULATION ---
            await new Promise(resolve => setTimeout(resolve, 1500)); 
            const data = mockUserProfile;
            // ---------------------------

            setUser(data);
            setFormData(data);
        } catch (err) {
            setError('Could not load profile data. Check if the backend is running and user ID is correct.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Function to update the user profile in the backend
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage('');
        setError(null);

        // Prepare the data to be sent (ensure the structure matches your Java User model)
        const dataToSave = {
            ...formData,
            // You might strip sensitive or read-only fields here if necessary
        };
        
        try {
            // Calling the PUT /api/user/{id} endpoint
            // NOTE: Since the real API call would fail without the backend running, we use a mock for structure.
            // const updatedData = await apiCall(`/api/user/${currentUserId}`, {
            //     method: 'PUT',
            //     body: JSON.stringify(dataToSave)
            // });

            // --- MOCK UPDATE SIMULATION ---
            await new Promise(resolve => setTimeout(resolve, 1500)); 
            const updatedData = dataToSave;
            // -----------------------------

            setUser(updatedData);
            setFormData(updatedData);
            setMessage('Profile updated successfully!');
            setIsEditing(false); // Close edit mode on success

        } catch (err) {
            setError('Failed to update profile. Please check the network or server logs.');
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                <p className="ml-3 text-lg font-medium text-gray-700">Loading Profile...</p>
            </div>
        );
    }

    if (error && !user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="p-8 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg shadow-md">
                    <p className="font-bold">Error:</p>
                    <p>{error}</p>
                    <button 
                        onClick={fetchUserProfile}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-150"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8 flex justify-center">
            <div className="w-full max-w-4xl bg-white shadow-xl rounded-xl border border-gray-200">
                
                {/* Header */}
                <div className="p-6 sm:p-8 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-xl">
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center">
                        <User className="w-8 h-8 text-indigo-600 mr-3" />
                        My Profile Settings
                    </h1>
                    <p className="mt-1 text-gray-500">
                        Manage your SkillExchange identity, location, and bio.
                    </p>
                </div>

                {/* Status Messages */}
                {message && (
                    <div className="p-4 mx-6 mt-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded-lg">
                        {message}
                    </div>
                )}
                {error && (
                    <div className="p-4 mx-6 mt-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Profile Form */}
                <form onSubmit={handleSubmit} className="p-6 sm:p-8">
                    
                    {/* Toggle Edit Mode */}
                    <div className="flex justify-end mb-6">
                        <button 
                            type="button"
                            onClick={() => setIsEditing(!isEditing)}
                            className={`flex items-center px-4 py-2 text-sm font-medium rounded-full transition duration-150 ${
                                isEditing 
                                    ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                                    : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                            }`}
                        >
                            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                            <Edit className="w-4 h-4 ml-2" />
                        </button>
                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Name Field (Editable) */}
                        <InputField 
                            id="name"
                            label="Full Name"
                            icon={User}
                            value={formData.name || ''}
                            onChange={handleChange}
                            readOnly={!isEditing}
                        />

                        {/* Email Field (Read-Only) */}
                        <InputField 
                            id="email"
                            label="Email Address (Primary)"
                            icon={Mail}
                            value={formData.email || ''}
                            readOnly={true}
                            type="email"
                        />

                        {/* Role Field (Read-Only - Derived from BaseUser) */}
                        <InputField 
                            id="role"
                            label="Primary Role"
                            icon={NotepadText}
                            value={formData.role ? formData.role.replace('_', ' ') : ''}
                            readOnly={true}
                            description="Role is set during signup (Seeker or Provider)."
                        />

                        {/* Location Field (Editable) */}
                        <InputField 
                            id="location"
                            label="Location / Timezone"
                            icon={MapPin}
                            value={formData.location || ''}
                            onChange={handleChange}
                            readOnly={!isEditing}
                        />
                    </div>
                    
                    {/* Bio Textarea (Editable) */}
                    <div className="mt-6">
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                            Bio / What I Offer/Seek (Max 500 characters)
                        </label>
                        <textarea
                            id="bio"
                            name="bio"
                            rows="4"
                            maxLength="500"
                            value={formData.bio || ''}
                            onChange={handleChange}
                            readOnly={!isEditing}
                            className={`mt-1 block w-full rounded-lg border p-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ${
                                !isEditing ? 'bg-gray-50 border-gray-200 text-gray-600' : 'bg-white border-gray-300'
                            }`}
                            placeholder="Tell others about your skills and what you're looking for in an exchange."
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={!isEditing || isSaving}
                            className={`w-full md:w-auto flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm transition duration-200 ${
                                !isEditing
                                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                            }`}
                        >
                            {isSaving ? (
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            ) : (
                                <Save className="w-5 h-5 mr-2" />
                            )}
                            {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
                        </button>
                    </div>

                </form>

            </div>
        </div>
    );
};

// Reusable Input Field Component
const InputField = ({ id, label, icon: Icon, value, onChange, readOnly, type = 'text', description = '' }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 flex items-center">
            {Icon && <Icon className="w-4 h-4 mr-2 text-indigo-500" />}
            {label}
        </label>
        <input
            type={type}
            name={id}
            id={id}
            value={value}
            onChange={onChange}
            readOnly={readOnly}
            className={`mt-1 block w-full rounded-lg border p-3 shadow-sm transition duration-150 ${
                readOnly 
                    ? 'bg-gray-50 border-gray-200 text-gray-600 cursor-default' 
                    : 'bg-white border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
            }`}
        />
        {description && <p className="mt-1 text-xs text-gray-400">{description}</p>}
    </div>
);

// Default export is mandatory for a single file React component
export default Profile;