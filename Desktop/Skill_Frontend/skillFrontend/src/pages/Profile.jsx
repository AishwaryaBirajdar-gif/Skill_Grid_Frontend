import React, { useState, useEffect } from 'react';
import {
    Loader2,
    Edit2,
    X,
    Plus,
    Sparkles,
    MapPin,
    BookOpen,
    GraduationCap
} from 'lucide-react';

import axiosInstance from '../api/axiosInstance';

const CATEGORY_OPTIONS = [
    "Technology",
    "Fitness",
    "Arts",
    "Languages",
    "Music",
    "Academics & Tutoring",
    "Business",
    "Handicrafts & DIY",
    "Others"
];

const Profile = () => {

    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const getUserId = () =>
        localStorage.getItem('userId') ||
        localStorage.getItem('skillgrid_userId');

    const userId = getUserId();

    const isValidUser =
        userId &&
        userId !== "undefined" &&
        userId !== "null";

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        skillsOffered: [],
        skillsWanted: [],
        bio: '',
        location: ''
    });

    const [offeredInput, setOfferedInput] = useState({
        skillName: '',
        category: 'Technology',
        description: '',
        isTrending: false,
        karmaPoints: ''
    });

    const [wantedInput, setWantedInput] = useState({
        skillName: '',
        category: 'Technology',
        description: '',
        wantedType: 'LEARNING'
    });

    // FETCH USER
    useEffect(() => {

        if (!isValidUser) return;

        const fetchUserData = async () => {

            try {

                // USER DATA
                const userResponse = await axiosInstance.get(`/user/${userId}`);
                const user = userResponse.data;

                // ALL USER SKILLS
                const skillsResponse = await axiosInstance.get(`/skills/user/${userId}`);

                const allSkills = Array.isArray(skillsResponse.data)
                    ? skillsResponse.data
                    : [];

                // FILTER OFFERED
                const offeredSkills = allSkills.filter(
                    skill => skill.type === "OFFERED"
                );

                // FILTER WANTED
                const wantedSkills = allSkills.filter(
                    skill => skill.type === "WANTED"
                );

                setFormData({
                    name: user.name || '',
                    email: user.email || '',
                    bio: user.bio || '',
                    location: user.location || '',

                    // IMPORTANT
                    skillsOffered: offeredSkills,
                    skillsWanted: wantedSkills
                });

            } catch (error) {

                console.error("Error fetching user:", error);
            }
        };

        fetchUserData();

    }, [userId, isValidUser]);

    // NORMAL INPUTS
    const handleInputChange = (e) => {

        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 
    // ADD SKILL (FIXED - SINGLE CLEAN VERSION)
const addSkill = async (type) => {

    try {

        if (type === 'OFFERED') {

            if (
                !offeredInput.skillName.trim() ||
                !offeredInput.description.trim() ||
                formData.skillsOffered.some(
                    s => s.skillName === offeredInput.skillName
                )
            ) return;

            const response = await axiosInstance.post('/skills', {
                skillName: offeredInput.skillName,
                category: offeredInput.category,
                description: offeredInput.description,
                karmaPoints: String(offeredInput.karmaPoints || "0"),
                type: "OFFERED",
                userId: userId,
                trending: false
            });

            const savedSkill = response.data;

            setFormData(prev => ({
                ...prev,
                skillsOffered: [
                    ...prev.skillsOffered,
                    savedSkill
                ]
            }));

            setOfferedInput({
                skillName: '',
                category: 'Technology',
                description: '',
                isTrending: false,
                karmaPoints: ''
            });

        } else {

            if (
                !wantedInput.skillName.trim() ||
                !wantedInput.description.trim() ||
                formData.skillsWanted.some(
                    s => s.skillName === wantedInput.skillName
                )
            ) return;

            const response = await axiosInstance.post('/skills', {
                skillName: wantedInput.skillName,
                category: wantedInput.category,
                description: wantedInput.description,
                type: "WANTED",
                userId: userId,
                karmaPoints: "0",
                trending: false
            });

            const savedSkill = response.data;

            setFormData(prev => ({
                ...prev,
                skillsWanted: [
                    ...prev.skillsWanted,
                    savedSkill
                ]
            }));

            setWantedInput({
                skillName: '',
                category: 'Technology',
                description: '',
                wantedType: 'LEARNING'
            });
        }

    } catch (error) {

        console.error("Error adding skill:", error);
        alert("Failed to add skill.");
    }
};

    // REMOVE SKILL
    const removeSkill = (type, skillName) => {

        const listKey =
            type === 'OFFERED'
                ? 'skillsOffered'
                : 'skillsWanted';

        setFormData(prev => ({
            ...prev,
            [listKey]: prev[listKey].filter(
                s => s.skillName !== skillName
            )
        }));
    };

    // SAVE PROFILE
    const handleSave = async (e) => {

        e.preventDefault();

        const currentId = getUserId();

        if (!currentId || currentId === "undefined") {

            alert("Session Error: Please re-login.");

            return;
        }

        setIsSaving(true);

        try {

            await axiosInstance.put(`/user/${currentId}`, {
                ...formData,
                id: currentId
            });

            setIsSaving(false);

            setIsEditing(false);

            alert("Profile saved successfully!");

        } catch (error) {

            console.error("Save Error:", error);

            setIsSaving(false);

            alert("Failed to save profile.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-100 p-6 flex justify-center items-start">

            <div className="w-full max-w-2xl bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl border border-white p-8">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-6">

                    <div>

                        <h1 className="text-3xl font-black text-slate-800 flex items-center gap-2">
                            <Sparkles className="text-yellow-500 w-6 h-6" />
                            My Profile
                        </h1>

                        <p className="text-slate-500 text-sm mt-1">
                            Status:
                            {
                                isValidUser
                                    ? <span className="text-emerald-600 font-bold"> Connected</span>
                                    : <span className="text-rose-600 font-bold"> Disconnected</span>
                            }
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsEditing(!isEditing)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold transition-all ${
                            isEditing
                                ? 'bg-rose-50 text-rose-600'
                                : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                        }`}
                    >
                        {isEditing ? 'Cancel' : 'Edit Profile'}
                        <Edit2 className="w-4 h-4" />
                    </button>
                </div>

                {/* COUNTERS */}
                <div className="grid grid-cols-2 gap-4 mb-10">

                    <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-center gap-4">

                        <div className="bg-indigo-600 p-3 rounded-xl text-white">
                            <GraduationCap className="w-6 h-6" />
                        </div>

                        <div>
                            <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                                Offered
                            </p>

                            <p className="text-2xl font-black text-indigo-900">
                                {formData.skillsOffered.length}
                            </p>
                        </div>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-4">

                        <div className="bg-emerald-500 p-3 rounded-xl text-white">
                            <BookOpen className="w-6 h-6" />
                        </div>

                        <div>
                            <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                                Wanted
                            </p>

                            <p className="text-2xl font-black text-emerald-900">
                                {formData.skillsWanted.length}
                            </p>
                        </div>
                    </div>
                </div>

                {/* FORM */}
                <form onSubmit={handleSave} className="space-y-6">

                    {/* NAME + LOCATION */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <div className="space-y-2">

                            <label className="text-sm font-bold text-slate-700 ml-1">
                                Full Name
                            </label>

                            <input
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                readOnly={!isEditing}
                                className="w-full px-4 py-3 rounded-2xl border-2 bg-white outline-none focus:border-indigo-500 transition-all border-slate-100 read-only:bg-slate-50/50"
                            />
                        </div>

                        <div className="space-y-2">

                            <label className="text-sm font-bold text-slate-700 ml-1">
                                Location
                            </label>

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

                    {/* OFFERED */}
                    <SkillSection
                        title="Skills I Can Offer"
                        skills={formData.skillsOffered}
                        inputValue={offeredInput}
                        setInputValue={setOfferedInput}
                        onAdd={() => addSkill('OFFERED')}
                        onRemove={(skillName) =>
                            removeSkill('OFFERED', skillName)
                        }
                        isEditing={isEditing}
                        accentColor="bg-indigo-600"
                    />

                    {/* WANTED */}
                    <SkillSection
                        title="Skills I Want"
                        skills={formData.skillsWanted}
                        inputValue={wantedInput}
                        setInputValue={setWantedInput}
                        onAdd={() => addSkill('WANTED')}
                        onRemove={(skillName) =>
                            removeSkill('WANTED', skillName)
                        }
                        isEditing={isEditing}
                        accentColor="bg-emerald-500"
                    />

                    {/* BIO */}
                    <div className="space-y-2">

                        <label className="text-sm font-bold text-slate-700 ml-1">
                            Bio
                        </label>

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

                    {/* SAVE */}
                    {isEditing && (
                        <button
                            type="submit"
                            disabled={isSaving || !isValidUser}
                            className="w-full py-4 rounded-2xl font-black text-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-100"
                        >
                            {
                                isSaving
                                    ? <Loader2 className="animate-spin w-6 h-6" />
                                    : 'Confirm & Save to Database'
                            }
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
};

const SkillSection = ({
    title,
    skills,
    inputValue,
    setInputValue,
    onAdd,
    onRemove,
    isEditing,
    accentColor
}) => {

    const [showModal, setShowModal] = useState(false);

    return (

        <div className="space-y-3">

            {/* HEADER */}
            <div className="flex items-center justify-between">

                <label className="text-sm font-bold text-slate-700 ml-1">
                    {title}
                </label>

                {isEditing && (
                    <button
                        type="button"
                        onClick={() => setShowModal(true)}
                        className={`${accentColor} text-white px-4 py-2 rounded-2xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-md`}
                    >
                        <Plus className="w-4 h-4" />
                        Add Skill
                    </button>
                )}
            </div>

            {/* MODAL */}
            {showModal && (

                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">

                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-4 border border-slate-100">

                        {/* TITLE */}
                        <div className="flex items-center justify-between">

                            <h2 className="text-2xl font-black text-slate-800">
                                Add Skill
                            </h2>

                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="text-slate-400 hover:text-rose-500 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* SKILL NAME */}
                        <input
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none focus:border-indigo-300 transition-all"
                            placeholder="Skill Name"
                            value={inputValue.skillName}
                            onChange={(e) =>
                                setInputValue({
                                    ...inputValue,
                                    skillName: e.target.value
                                })
                            }
                        />

                        {/* CATEGORY */}
                        <select
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none focus:border-indigo-300 transition-all"
                            value={inputValue.category}
                            onChange={(e) =>
                                setInputValue({
                                    ...inputValue,
                                    category: e.target.value
                                })
                            }
                        >
                            {CATEGORY_OPTIONS.map(category => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>

                        {/* DESCRIPTION */}
                        <textarea
                            rows="4"
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none resize-none focus:border-indigo-300 transition-all"
                            placeholder="Description"
                            value={inputValue.description}
                            onChange={(e) =>
                                setInputValue({
                                    ...inputValue,
                                    description: e.target.value
                                })
                            }
                        />

                        {/* KARMA POINTS ONLY FOR OFFERED SKILLS */}
                        {title === "Skills I Can Offer" && (
                            <input
                                type="number"
                                min="0"
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none focus:border-indigo-300 transition-all"
                                placeholder="Insert expected karma points"
                                value={inputValue.karmaPoints || ''}
                                onChange={(e) =>
                                    setInputValue({
                                        ...inputValue,
                                        karmaPoints: Number(e.target.value)
                                    })
                                }
                            />
                        )}

                        {/* SAVE */}
                        <button
                            type="button"
                            onClick={() => {
                                onAdd();
                                setShowModal(false);
                            }}
                            className={`w-full ${accentColor} text-white py-3 rounded-2xl font-black hover:scale-[1.02] active:scale-[0.99] transition-all shadow-lg`}
                        >
                            Save Skill
                        </button>
                    </div>
                </div>
            )}

            {/* SKILLS */}
            <div className="flex flex-wrap gap-2">

                {skills.map((skill, index) => (

                    <div
                        key={index}
                        className="relative flex items-center gap-2 bg-white border-2 border-slate-100 px-4 py-3 rounded-xl shadow-sm hover:border-indigo-200 transition-all"
                    >

                        <div className="flex flex-col">

                            <span className="text-sm font-semibold text-slate-700">
                                {skill.skillName}
                            </span>
                            

                            {title === "Skills I Can Offer" && skill.depthLevel && (
                                <span
                                    className={`text-xs font-bold px-2 py-1 rounded-full mt-1 w-fit
                                    ${skill.depthLevel === 'Beginner'
                                        ? 'bg-red-100 text-red-600'
                                        : skill.depthLevel === 'Intermediate'
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : skill.depthLevel === 'Advanced'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-green-100 text-green-700'
                                    }`}
                                >
                                    {skill.depthLevel}
                                </span>
                            )}
                           {title === "Skills I Can Offer" && skill.karmaPoints && (
                                <div className="absolute top-2 right-2 bg-gradient-to-br from-yellow-300 to-yellow-500 text-white text-xs font-bold w-7 h-7 flex items-center justify-center rounded-full shadow-md border border-yellow-600">
                                    {skill.karmaPoints}
                                </div>
                            )}
                        </div>

                        {isEditing && (
                            <button
                                type="button"
                                onClick={() => onRemove(skill.skillName)}
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
};

export default Profile;