import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { Search, User, Coins, Award } from 'lucide-react';
import toast from 'react-hot-toast';

const BrowseSkills = () => {
    const [allSkills, setAllSkills] = useState([]);
    const [filteredSkills, setFilteredSkills] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [userCache, setUserCache] = useState({});
    const [myProfile, setMyProfile] = useState(null);

    // Modal States
    const [showModal, setShowModal] = useState(false);
    const [selectedSkill, setSelectedSkill] = useState(null);
    const [useKarma, setUseKarma] = useState(false); 

    const currentUserId = localStorage.getItem('userId') || localStorage.getItem('skillgrid_userId');
    const navigate = useNavigate();

    // ---------------- FETCH MY PROFILE ----------------
    useEffect(() => {
        const fetchMyProfile = async () => {
            if (!currentUserId) return;
            try {
                const res = await axiosInstance.get(`/user/${currentUserId}`);
                setMyProfile(res.data);
            } catch (err) {
                console.error("Profile fetch error:", err);
            }
        };
        fetchMyProfile();
    }, [currentUserId]);

    // ---------------- FETCH ALL SKILLS ----------------
    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const res = await axiosInstance.get(`/skills`);
                const offered = res.data.filter(skill => skill.type === "OFFERED");
                // Filter out current user's own skills
                const otherUsersSkills = offered.filter(skill => skill.userId !== currentUserId);

                setAllSkills(otherUsersSkills);
                setFilteredSkills(otherUsersSkills);

                // Start caching user details for the names
                otherUsersSkills.forEach(skill => fetchUser(skill.userId));
            } catch (err) {
                console.error("Error fetching skills:", err);
            }
        };
        fetchSkills();
    }, [currentUserId]);

    const fetchUser = async (userId) => {
        if (!userId || userCache[userId]) return;
        try {
            const res = await axiosInstance.get(`/user/${userId}`);
            setUserCache(prev => ({ ...prev, [userId]: res.data }));
        } catch (err) {
            console.error("User fetch error:", err);
        }
    };

    // ---------------- SEARCH ----------------
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredSkills(allSkills);
            return;
        }
        const lower = searchTerm.toLowerCase();
        const filtered = allSkills.filter(skill =>
            skill.skillName?.toLowerCase().includes(lower) ||
            skill.category?.toLowerCase().includes(lower) ||
            skill.description?.toLowerCase().includes(lower)
        );
        setFilteredSkills(filtered);
    }, [searchTerm, allSkills]);

    const openRequestModal = (skill) => {
        setSelectedSkill(skill);
        setUseKarma(false); 
        setShowModal(true);
    };

    // ---------------- SEND REQUEST ----------------
    const sendRequest = async () => {
        // 1. Determine what the user is offering
        const myFirstSkill = myProfile?.skillsOffered?.[0]?.skillName;
        const expectedPrice = selectedSkill?.karmaPoints || 50; 

        // 2. Karma Balance Guard (Stopper)
        if (useKarma && (myProfile?.karmaPoints < expectedPrice)) {
            toast.error(`You don't have enough Karma! Need ${expectedPrice} KP.`);
            return;
        }

        const receiverId = selectedSkill.userId;
        
        // 3. Construct Payload
        const payload = {
            senderId: currentUserId,
            senderName: localStorage.getItem('userName') || "User", 
            receiverId: receiverId,
            receiverName: userCache[receiverId]?.name || "Expert", 
            skillRequested: selectedSkill.skillName,
            
            // ✅ LOGIC FIX: Switch between Skill Name or KARMA_PAYMENT constant
            skillOffered: useKarma ? "KARMA_PAYMENT" : (myFirstSkill || "Skill Barter"),
            
            totalKarmaPrice: expectedPrice,
            status: "PENDING",
            senderProgress: 0,
            receiverProgress: 0,
            senderLocked: false,
            receiverLocked: false
        };

        try {
            // Note: Ensure your axiosInstance base URL matches your @RequestMapping
            const response = await axiosInstance.post('/requests/send', payload);
            
            if (response.status === 200 || response.status === 201) {
                toast.success("Request sent successfully!");
                setShowModal(false);
                navigate('/my-requests');
            }
        } catch (err) {
            console.error("Request failed:", err);
            toast.error("Failed to send request.");
        }
    };

    const myFirstSkillName = myProfile?.skillsOffered?.[0]?.skillName;
    const currentPrice = selectedSkill?.karmaPoints || 50;
    const hasEnoughKarma = (myProfile?.karmaPoints || 0) >= currentPrice;
    const canSend = useKarma ? hasEnoughKarma : (!!myFirstSkillName);

    return (
        <div className="min-h-screen bg-slate-50 p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-black mb-6">Browse Skills</h1>

                <div className="relative mb-10">
                    <input
                        className="w-full p-5 pl-14 rounded-2xl shadow border outline-none"
                        placeholder="Search skills (React, Java, Design...)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {filteredSkills.map(skill => {
                        const user = userCache[skill.userId];
                        if (!user) return null; 

                        return (
                            <div key={skill.id} className="bg-white p-6 rounded-2xl shadow border hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-slate-100 p-2 rounded-full">
                                        <User className="text-slate-400" size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-700">{user.name}</p>
                                        <p className="text-xs text-gray-400">{user.location || "Remote"}</p>
                                    </div>
                                </div>
                                <h2 className="text-lg font-bold text-slate-800">{skill.skillName}</h2>
                                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{skill.description}</p>
                                <div className="flex gap-2 mt-4">
                                    <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                        <Coins size={12} /> {skill.karmaPoints || 50}
                                    </div>
                                    <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
                                        {skill.depthLevel || 'Beginner'}
                                    </div>
                                </div>
                                <button
                                    onClick={() => openRequestModal(skill)}
                                    className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-all font-bold shadow-lg shadow-indigo-100"
                                >
                                    Send Request
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl">
                        <h2 className="text-2xl font-black text-slate-800 mb-2">Request Skill</h2>
                        <p className="mb-6 text-slate-500">Learn: <span className="text-indigo-600 font-bold">{selectedSkill?.skillName}</span></p>

                        <div className="space-y-4">
                            {/* Option 1: Skill Barter */}
                            <div 
                                onClick={() => setUseKarma(false)}
                                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${!useKarma ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-100'}`}
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <Award size={18} className={!useKarma ? 'text-indigo-600' : 'text-slate-400'} />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Option 1: Skill Barter</span>
                                </div>
                                <div className="font-bold text-slate-700 text-sm">{myFirstSkillName || "No Skill to Offer"}</div>
                            </div>

                            <div className="text-center text-slate-300 font-black text-[10px] tracking-[0.3em] py-1">OR</div>

                            {/* Option 2: Pay Karma */}
                            <div 
                                onClick={() => setUseKarma(true)}
                                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${useKarma ? 'border-amber-500 bg-amber-50/50' : 'border-slate-100'}`}
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <Coins size={18} className={useKarma ? 'text-amber-600' : 'text-slate-400'} />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Option 2: Pay Karma</span>
                                </div>
                                <div className="flex justify-between items-center bg-white border border-slate-200 p-3 rounded-xl">
                                    <span className="font-bold text-slate-700 text-sm">{currentPrice} Karma Points</span>
                                    <div className={`text-[9px] font-black px-2 py-1 rounded-lg ${!hasEnoughKarma ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                                        Balance: {myProfile?.karmaPoints || 0}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 space-y-3">
                            <button
                                disabled={!canSend}
                                onClick={sendRequest}
                                className={`w-full py-4 rounded-2xl font-black transition-all ${canSend ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                            >
                                Send Request
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-full py-2 text-xs font-bold text-slate-400"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BrowseSkills;