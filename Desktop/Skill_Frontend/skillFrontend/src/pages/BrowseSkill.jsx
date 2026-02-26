import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Search, User, ArrowRightLeft, Send, CheckCircle, X } from 'lucide-react';

const BrowseSkills = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [myProfile, setMyProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [requestStatus, setRequestStatus] = useState({});
    
    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [offeredSkill, setOfferedSkill] = useState('');

    const currentUserId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchMyProfile = async () => {
            try {
                const res = await axiosInstance.get(`/user/${currentUserId}`);
                setMyProfile(res.data);
                if (res.data.skillsOffered?.length > 0) {
                    setOfferedSkill(res.data.skillsOffered[0]);
                }
            } catch (err) {
                console.error("Error fetching your profile", err);
            }
        };
        fetchMyProfile();
    }, [currentUserId]);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axiosInstance.get(`/user/browse?skill=${searchTerm}`);
            setUsers(res.data.filter(u => u.id !== currentUserId));
        } catch (err) {
            console.error("Search failed", err);
        } finally {
            setLoading(false);
        }
    };

    const openRequestModal = (user) => {
        setSelectedUser(user);
        // Auto-select a matching skill if available
        const match = myProfile?.skillsOffered.find(s => user.skillsWanted.includes(s));
        setOfferedSkill(match || myProfile?.skillsOffered[0] || "");
        setShowModal(true);
    };

    const confirmAndSendRequest = async () => {
        const payload = {
            senderId: currentUserId,
            receiverId: selectedUser.id,
            skillRequested: searchTerm,
            skillOffered: offeredSkill,
            status: "PENDING"
        };

        try {
            await axiosInstance.post('/requests/send', payload);
            setRequestStatus(prev => ({ ...prev, [selectedUser.id]: 'SENT' }));
            setShowModal(false);
            alert(`Request sent to ${selectedUser.name}!`);
        } catch (err) {
            alert("Failed to send request.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-black text-slate-800 mb-8">Browse Skills</h1>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="relative mb-12">
                    <input 
                        type="text"
                        placeholder="What do you want to learn? (e.g. Java, Design)"
                        className="w-full p-6 pl-16 rounded-3xl shadow-xl border-none focus:ring-4 focus:ring-indigo-300 text-lg"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={28} />
                    <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all">
                        Search
                    </button>
                </form>

                {/* Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {users.map(user => {
                        const isMatch = user.skillsWanted.some(skill => myProfile?.skillsOffered.includes(skill));

                        return (
                            <div key={user.id} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 hover:shadow-xl transition-all flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="bg-indigo-100 p-4 rounded-2xl text-indigo-600">
                                            <User size={32} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-800">{user.name}</h3>
                                            <p className="text-slate-500 text-sm">{user.location}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <div>
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Offers</p>
                                            <div className="flex flex-wrap gap-2">
                                                {user.skillsOffered.map(s => <span key={s} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">{s}</span>)}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Wants</p>
                                            <div className="flex flex-wrap gap-2">
                                                {user.skillsWanted.map(s => <span key={s} className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">{s}</span>)}
                                            </div>
                                        </div>
                                    </div>

                                    {isMatch && (
                                        <div className="bg-amber-50 text-amber-700 p-3 rounded-xl flex items-center gap-2 mb-6 text-sm font-bold">
                                            <ArrowRightLeft size={16} /> Direct Barter Match!
                                        </div>
                                    )}
                                </div>

                                <button 
                                    onClick={() => openRequestModal(user)}
                                    disabled={requestStatus[user.id] === 'SENT'}
                                    className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                                        requestStatus[user.id] === 'SENT' 
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-lg'
                                    }`}
                                >
                                    {requestStatus[user.id] === 'SENT' ? (
                                        <><CheckCircle size={20}/> Request Sent</>
                                    ) : (
                                        <><Send size={20}/> Send Barter Request</>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
                
                {users.length === 0 && !loading && (
                    <div className="text-center py-20">
                        <p className="text-slate-400 text-lg font-medium">Search for a skill to find barter partners!</p>
                    </div>
                )}
            </div>

            {/* --- BARTER REQUEST MODAL --- */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
                        <button onClick={() => setShowModal(false)} className="absolute right-6 top-6 text-slate-400 hover:text-slate-600">
                            <X size={24} />
                        </button>
                        
                        <h2 className="text-2xl font-black text-slate-800 mb-2">New Barter Request</h2>
                        <p className="text-slate-500 mb-8 text-sm">Propose a skill exchange with <span className="font-bold text-indigo-600">{selectedUser?.name}</span></p>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">You Want to Learn</label>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-700 capitalize">
                                    {searchTerm}
                                </div>
                            </div>

                            <ArrowRightLeft className="mx-auto text-indigo-400" size={32} />

                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">You Offer in Exchange</label>
                                <select 
                                    className="w-full p-4 bg-white rounded-2xl border-2 border-slate-100 focus:border-indigo-500 outline-none font-bold text-slate-700"
                                    value={offeredSkill}
                                    onChange={(e) => setOfferedSkill(e.target.value)}
                                >
                                    {myProfile?.skillsOffered.map(skill => (
                                        <option key={skill} value={skill}>{skill}</option>
                                    ))}
                                </select>
                            </div>

                            <button 
                                onClick={confirmAndSendRequest}
                                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all mt-4"
                            >
                                Confirm & Send Request
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BrowseSkills;