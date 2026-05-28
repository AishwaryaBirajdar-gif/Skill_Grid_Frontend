import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { Search, User, Coins, Award, Star } from 'lucide-react'; // Added Star
import toast from 'react-hot-toast';

// ✅ NEW SUB-COMPONENT: Displays rating for each user card without affecting main state
const UserRating = ({ userId }) => {
    const [rating, setRating] = useState({ average: 0, total: 0 });

    useEffect(() => {
        const fetchRating = async () => {
            try {
                // Ensure your backend controller has the /summary endpoint
                const res = await axiosInstance.get(`/feedback/user/${userId}/summary`);
                setRating({
                    average: res.data.averageRating || 0,
                    total: res.data.totalReviews || 0
                });
            } catch (err) {
                // Silently fails if no rating exists, keeping the card clean
            }
        };
        if (userId) fetchRating();
    }, [userId]);

    if (rating.total === 0) return null; 

    return (
        <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
            <Star size={10} className="text-amber-500 fill-amber-500" />
            <span className="text-[10px] font-black text-amber-700">
                {rating.average} ({rating.total})
            </span>
        </div>
    );
};

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
                const otherUsersSkills = offered.filter(skill => skill.userId !== currentUserId);

                setAllSkills(otherUsersSkills);
                setFilteredSkills(otherUsersSkills);

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
        const myFirstSkill = myProfile?.skillsOffered?.[0]?.skillName;
        const expectedPrice = selectedSkill?.karmaPoints || 50; 

        if (useKarma && (myProfile?.karmaPoints < expectedPrice)) {
            toast.error(`You don't have enough Karma! Need ${expectedPrice} KP.`);
            return;
        }

        const receiverId = selectedSkill.userId;
        
        const payload = {
            senderId: currentUserId,
            senderName: localStorage.getItem('userName') || "User", 
            receiverId: receiverId,
            receiverName: userCache[receiverId]?.name || "Expert", 
            skillRequested: selectedSkill.skillName,
            skillOffered: useKarma ? "KARMA_PAYMENT" : (myFirstSkill || "Skill Barter"),
            totalKarmaPrice: expectedPrice,
            status: "PENDING",
            senderProgress: 0,
            receiverProgress: 0,
            senderLocked: false,
            receiverLocked: false
        };

        try {
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
                <h1 className="text-4xl font-black mb-6 tracking-tighter">Browse Skills</h1>

                <div className="relative mb-10">
                    <input
                        className="w-full p-5 pl-14 rounded-2xl shadow-sm border border-slate-200 outline-none focus:border-indigo-500 transition-all"
                        placeholder="Search skills (React, Java, Design...)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {filteredSkills.map(skill => {
                        const user = userCache[skill.userId];
                        if (!user) return null; 

                        return (
                            <div key={skill.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-indigo-50 p-3 rounded-2xl">
                                        <User className="text-indigo-400" size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 leading-none mb-1">{user.name}</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{user.location || "Remote"}</p>
                                            {/* ✅ INTEGRATED RATING COMPONENT */}
                                            <UserRating userId={skill.userId} />
                                        </div>
                                    </div>
                                </div>
                                <h2 className="text-lg font-black text-slate-800 tracking-tight">{skill.skillName}</h2>
                                <p className="text-sm text-gray-500 mt-2 line-clamp-2 h-10">{skill.description}</p>
                                <div className="flex gap-2 mt-4">
                                    <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1">
                                        <Coins size={12} /> {skill.karmaPoints || 50} KP
                                    </div>
                                    <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                                        {skill.depthLevel || 'Beginner'}
                                    </div>
                                </div>
                                <button
                                    onClick={() => openRequestModal(skill)}
                                    className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-2xl hover:bg-indigo-700 transition-all font-black uppercase tracking-widest text-xs shadow-lg shadow-indigo-100"
                                >
                                    Send Request
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* MODAL (Logic untouched) */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 backdrop-blur-md p-4">
                    <div className="bg-white p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl animate-in zoom-in duration-300">
                        <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tighter">Request Skill</h2>
                        <p className="mb-6 text-slate-500 text-sm">You're requesting to learn: <span className="text-indigo-600 font-bold">{selectedSkill?.skillName}</span></p>

                        <div className="space-y-4">
                            <div 
                                onClick={() => setUseKarma(false)}
                                className={`p-5 rounded-3xl border-2 cursor-pointer transition-all ${!useKarma ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-100 hover:border-slate-200'}`}
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <Award size={18} className={!useKarma ? 'text-indigo-600' : 'text-slate-400'} />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Option 1: Skill Barter</span>
                                </div>
                                <div className="font-bold text-slate-700 text-sm">{myFirstSkillName || "Add a skill to your profile first"}</div>
                            </div>

                            <div className="text-center text-slate-300 font-black text-[10px] tracking-[0.3em] py-1">OR</div>

                            <div 
                                onClick={() => setUseKarma(true)}
                                className={`p-5 rounded-3xl border-2 cursor-pointer transition-all ${useKarma ? 'border-amber-500 bg-amber-50/50' : 'border-slate-100 hover:border-slate-200'}`}
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <Coins size={18} className={useKarma ? 'text-amber-600' : 'text-slate-400'} />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Option 2: Pay Karma</span>
                                </div>
                                <div className="flex justify-between items-center bg-white border border-slate-200 p-3 rounded-2xl">
                                    <span className="font-bold text-slate-700 text-sm">{currentPrice} KP</span>
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
                                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${canSend ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-200' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                            >
                                {canSend ? "Confirm Request" : "Incomplete Profile"}
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-full py-2 text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 tracking-widest"
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