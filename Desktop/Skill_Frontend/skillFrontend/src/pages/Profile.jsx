import React, { useState } from 'react';
import { User, Mail, MapPin, Save, Loader2, Edit2, X, Plus, Clock, Sparkles } from 'lucide-react';

const Profile = () => {
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(true); // Started as true so you can type immediately
    
    // Main state starts EMPTY so you can type your own data
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        location: '',
        availability: 'Evenings',
        skillsOffered: [],
        skillsDesired: [],
        bio: ''
    });

    const [offeredInput, setOfferedInput] = useState('');
    const [desiredInput, setDesiredInput] = useState('');

    // This handles typing in Name, Email, Location, and Bio
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: value 
        }));
    };

    const addSkill = (type) => {
        const value = type === 'offered' ? offeredInput : desiredInput;
        const listKey = type === 'offered' ? 'skillsOffered' : 'skillsDesired';

        if (value.trim() && !formData[listKey].includes(value.trim())) {
            setFormData(prev => ({
                ...prev,
                [listKey]: [...prev[listKey], value.trim()]
            }));
            type === 'offered' ? setOfferedInput('') : setDesiredInput('');
        }
    };

    const removeSkill = (type, skillToRemove) => {
        const listKey = type === 'offered' ? 'skillsOffered' : 'skillsDesired';
        setFormData(prev => ({
            ...prev,
            [listKey]: prev[listKey].filter(s => s !== skillToRemove)
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        // Simulate a save to backend
        setTimeout(() => {
            setIsSaving(false);
            setIsEditing(false);
            alert("Profile Saved Locally!");
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-100 p-6 flex justify-center items-start">
            <div className="w-full max-w-2xl bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl border border-white p-8">
                
                {/* Header Section */}
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 flex items-center gap-2">
                            <Sparkles className="text-yellow-500 w-6 h-6" /> 
                            Create Profile
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">Fill in your details to get started</p>
                    </div>
                    <button 
                        type="button"
                        onClick={() => setIsEditing(!isEditing)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold transition-all ${
                            isEditing 
                            ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' 
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                    >
                        {isEditing ? 'View Mode' : 'Edit Profile'} 
                        <Edit2 className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSave} className="space-y-8">
                    {/* Basic Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                                <input 
                                    name="name"
                                    placeholder="Enter your name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    readOnly={!isEditing}
                                    className={`w-full pl-11 pr-4 py-3 rounded-2xl border-2 transition-all outline-none ${
                                        isEditing ? 'border-indigo-100 focus:border-indigo-500 bg-white' : 'border-transparent bg-slate-100'
                                    }`}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                                <input 
                                    name="email"
                                    placeholder="your@email.com"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    readOnly={!isEditing}
                                    className={`w-full pl-11 pr-4 py-3 rounded-2xl border-2 transition-all outline-none ${
                                        isEditing ? 'border-indigo-100 focus:border-indigo-500 bg-white' : 'border-transparent bg-slate-100'
                                    }`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Location & Availability */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                                <input 
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    readOnly={!isEditing}
                                    placeholder="City, Country"
                                    className={`w-full pl-11 pr-4 py-3 rounded-2xl border-2 transition-all outline-none ${
                                        isEditing ? 'border-indigo-100 focus:border-indigo-500 bg-white' : 'border-transparent bg-slate-100'
                                    }`}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Availability</label>
                            <div className="relative">
                                <Clock className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                                <select 
                                    name="availability"
                                    value={formData.availability}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className={`w-full pl-11 pr-4 py-3 rounded-2xl border-2 transition-all outline-none appearance-none ${
                                        isEditing ? 'border-indigo-100 focus:border-indigo-500 bg-white' : 'border-transparent bg-slate-100'
                                    }`}
                                >
                                    <option value="Mornings">Mornings</option>
                                    <option value="Afternoons">Afternoons</option>
                                    <option value="Evenings">Evenings</option>
                                    <option value="Weekends">Weekends</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Skills You Can Offer */}
                    <SkillSection 
                        title="Skills You Can Offer"
                        type="offered"
                        skills={formData.skillsOffered}
                        inputValue={offeredInput}
                        setInputValue={setOfferedInput}
                        onAdd={() => addSkill('offered')}
                        onRemove={(s) => removeSkill('offered', s)}
                        isEditing={isEditing}
                        accentColor="bg-indigo-600"
                    />

                    {/* Skills You Want to Learn */}
                    <SkillSection 
                        title="Skills You Want to Learn"
                        type="desired"
                        skills={formData.skillsDesired}
                        inputValue={desiredInput}
                        setInputValue={setDesiredInput}
                        onAdd={() => addSkill('desired')}
                        onRemove={(s) => removeSkill('desired', s)}
                        isEditing={isEditing}
                        accentColor="bg-emerald-500"
                    />

                    {/* Bio */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Bio</label>
                        <textarea 
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            readOnly={!isEditing}
                            rows="3"
                            placeholder="Tell the community about yourself..."
                            className={`w-full p-4 rounded-2xl border-2 transition-all outline-none resize-none ${
                                isEditing ? 'border-indigo-100 focus:border-indigo-500 bg-white' : 'border-transparent bg-slate-100'
                            }`}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!isEditing || isSaving}
                        className={`w-full py-4 rounded-2xl font-black text-lg transition-all duration-300 transform active:scale-95 ${
                            isEditing 
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-200' 
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                        {isSaving ? <Loader2 className="animate-spin mx-auto" /> : 'Save Profile Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const SkillSection = ({ title, skills, inputValue, setInputValue, onAdd, onRemove, isEditing, accentColor }) => (
    <div className="space-y-3">
        <label className="text-sm font-bold text-slate-700 ml-1">{title}</label>
        {isEditing && (
            <div className="flex gap-2">
                <input 
                    className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none focus:border-indigo-300 focus:bg-white transition-all"
                    placeholder="Add a skill (e.g. Java)"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); onAdd(); }}}
                />
                <button 
                    type="button"
                    onClick={onAdd}
                    className={`${accentColor} text-white p-3 rounded-2xl hover:scale-105 active:scale-90 transition-all shadow-lg`}
                >
                    <Plus className="w-6 h-6" />
                </button>
            </div>
        )}
        <div className="flex flex-wrap gap-2 min-h-[40px]">
            {skills.map((skill, index) => (
                <div key={index} className="flex items-center gap-2 bg-white border-2 border-slate-100 px-4 py-1.5 rounded-xl shadow-sm">
                    <span className="text-sm font-semibold text-slate-700">{skill}</span>
                    {isEditing && (
                        <button type="button" onClick={() => onRemove(skill)} className="text-slate-300 hover:text-rose-500">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            ))}
        </div>
    </div>
);

export default Profile;