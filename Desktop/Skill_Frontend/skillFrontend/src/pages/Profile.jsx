import React, { useState, useEffect } from 'react';
import { Mail, Loader2, Edit2, X, Plus, Sparkles, MapPin, BookOpen, GraduationCap } from 'lucide-react';
import axiosInstance from '../api/axiosInstance'; 

const Profile = () => {
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false); 
    
    const getUserId = () => localStorage.getItem('userId') || localStorage.getItem('skillgrid_userId');
    const userId = getUserId();
    const isValidUser = userId && userId !== "undefined" && userId !== "null";

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        skillsOffered: [],
        skillsWanted: [],
        bio: '',
        location: ''
    });

    const [offeredInput, setOfferedInput] = useState('');
    const [wantedInput, setWantedInput] = useState('');

    // ✅ FETCH DATA: This prevents the "vanishing" issue by loading from DB on mount
    useEffect(() => {
        if (!isValidUser) return;

        const fetchUserData = async () => {
            try {
                const response = await axiosInstance.get(`/user/${userId}`);
                const user = response.data;
                
                setFormData({
                    name: user.name || '',
                    email: user.email || '',
                    bio: user.bio || '',
                    location: user.location || '',
                    skillsOffered: Array.isArray(user.skillsOffered) ? user.skillsOffered : [],
                    skillsWanted: Array.isArray(user.skillsWanted) ? user.skillsWanted : []
                });
            } catch (error) {
                console.error("Error fetching user:", error);
            }
        };
        fetchUserData();
    }, [userId, isValidUser]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addSkill = (type) => {
        const input = type === 'OFFERED' ? offeredInput : wantedInput;
        const listKey = type === 'OFFERED' ? 'skillsOffered' : 'skillsWanted';

        if (input.trim() && !formData[listKey].includes(input.trim())) {
            setFormData(prev => ({
                ...prev,
                [listKey]: [...prev[listKey], input.trim()]
            }));
            type === 'OFFERED' ? setOfferedInput('') : setWantedInput('');
        }
    };

    const removeSkill = (type, skillName) => {
        const listKey = type === 'OFFERED' ? 'skillsOffered' : 'skillsWanted';
        setFormData(prev => ({
            ...prev,
            [listKey]: prev[listKey].filter(s => s !== skillName)
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const currentId = getUserId();
        if (!currentId || currentId === "undefined") {
            alert("Session Error: Please re-login.");
            return;
        }

        setIsSaving(true);
        try {
            // ✅ Data is saved to the 'baseUser' collection in MongoDB
            await axiosInstance.put(`/user/${currentId}`, {
                ...formData,
                id: currentId 
            });
            
            setIsSaving(false);
            setIsEditing(false);
            alert("Profile saved to Database!");
        } catch (error) {
            console.error("Save Error:", error);
            setIsSaving(false);
            alert("Failed to save profile.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-100 p-6 flex justify-center items-start">
            <div className="w-full max-w-2xl bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl border border-white p-8">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 flex items-center gap-2">
                            <Sparkles className="text-yellow-500 w-6 h-6" /> My Profile
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">
                            Status: {isValidUser ? <span className="text-emerald-600 font-bold">Connected</span> : <span className="text-rose-600 font-bold">Disconnected</span>}
                        </p>
                    </div>
                    <button 
                        type="button"
                        onClick={() => setIsEditing(!isEditing)} 
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold transition-all ${isEditing ? 'bg-rose-50 text-rose-600' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'}`}
                    >
                        {isEditing ? 'Cancel' : 'Edit Profile'} <Edit2 className="w-4 h-4" />
                    </button>
                </div>

                {/* ✅ INCREMENT BOXES (Counters) */}
                <div className="grid grid-cols-2 gap-4 mb-10">
                    <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-center gap-4">
                        <div className="bg-indigo-600 p-3 rounded-xl text-white">
                            <GraduationCap className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Offered</p>
                            <p className="text-2xl font-black text-indigo-900">{formData.skillsOffered.length}</p>
                        </div>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-4">
                        <div className="bg-emerald-500 p-3 rounded-xl text-white">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Wanted</p>
                            <p className="text-2xl font-black text-emerald-900">{formData.skillsWanted.length}</p>
                        </div>
                    </div>
                </div>

                {!isValidUser && (
                    <div className="mb-6 p-4 bg-rose-100 text-rose-800 rounded-2xl border border-rose-200 text-sm font-bold flex items-center gap-2">
                        <X className="w-5 h-5" /> ⚠️ Session Missing. Please log in again.
                    </div>
                )}

                <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                            <input 
                                name="name" 
                                value={formData.name} 
                                onChange={handleInputChange} 
                                readOnly={!isEditing} 
                                className="w-full px-4 py-3 rounded-2xl border-2 bg-white outline-none focus:border-indigo-500 transition-all border-slate-100 read-only:bg-slate-50/50" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    name="location" 
                                    value={formData.location} 
                                    onChange={handleInputChange}
                                    readOnly={!isEditing} 
                                    placeholder="City, Country"
                                    className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 bg-white outline-none focus:border-indigo-500 border-slate-100 read-only:bg-slate-50/50" 
                                />
                            </div>
                        </div>
                    </div>

                    <SkillSection 
                        title="Skills I Can Teach" 
                        skills={formData.skillsOffered} 
                        inputValue={offeredInput} 
                        setInputValue={setOfferedInput} 
                        onAdd={() => addSkill('OFFERED')} 
                        onRemove={(s) => removeSkill('OFFERED', s)} 
                        isEditing={isEditing} 
                        accentColor="bg-indigo-600" 
                    />
                    
                    <SkillSection 
                        title="Skills I Want to Learn" 
                        skills={formData.skillsWanted} 
                        inputValue={wantedInput} 
                        setInputValue={setWantedInput} 
                        onAdd={() => addSkill('WANTED')} 
                        onRemove={(s) => removeSkill('WANTED', s)} 
                        isEditing={isEditing} 
                        accentColor="bg-emerald-500" 
                    />

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Bio</label>
                        <textarea 
                            name="bio" 
                            value={formData.bio} 
                            onChange={handleInputChange} 
                            readOnly={!isEditing} 
                            rows="3" 
                            placeholder="Tell the community who you are..."
                            className="w-full p-4 rounded-2xl border-2 bg-white outline-none resize-none focus:border-indigo-500 transition-all border-slate-100 read-only:bg-slate-50/50" 
                        />
                    </div>

                    {isEditing && (
                        <button 
                            type="submit" 
                            disabled={isSaving || !isValidUser} 
                            className="w-full py-4 rounded-2xl font-black text-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-100"
                        >
                            {isSaving ? <Loader2 className="animate-spin w-6 h-6" /> : 'Confirm & Save to Database'}
                        </button>
                    )}
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
                    className="flex-1 bg-slate-50 border-2 rounded-2xl px-4 py-3 outline-none focus:border-indigo-300 transition-all border-slate-100" 
                    placeholder="Add a skill..." 
                    value={inputValue} 
                    onChange={(e) => setInputValue(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), onAdd())} 
                />
                <button 
                    type="button" 
                    onClick={onAdd} 
                    className={`${accentColor} text-white p-3 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-md`}
                >
                    <Plus className="w-6 h-6" />
                </button>
            </div>
        )}
        <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
                <div key={index} className="flex items-center gap-2 bg-white border-2 border-slate-100 px-4 py-1.5 rounded-xl shadow-sm hover:border-indigo-200 transition-colors">
                    <span className="text-sm font-semibold text-slate-700">{skill}</span>
                    {isEditing && (
                        <button 
                            type="button" 
                            onClick={() => onRemove(skill)} 
                            className="text-slate-300 hover:text-rose-500 transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            ))}
        </div>
    </div>
);

export default Profile;