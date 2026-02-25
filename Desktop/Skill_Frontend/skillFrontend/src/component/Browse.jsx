import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Search, User, MapPin, Loader2, Send, CheckCircle } from 'lucide-react';

const Browse = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mySkills, setMySkills] = useState([]);
    const [sentRequests, setSentRequests] = useState([]); // Track sent status locally
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchMyProfile = async () => {
            if (!userId) return;
            try {
                const res = await axiosInstance.get(`/user/${userId}`);
                setMySkills(res.data.skillsOffered || []);
            } catch (err) {
                console.error("Error fetching own skills:", err);
            }
        };
        fetchMyProfile();
    }, [userId]);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/user/browse?skill=${searchQuery}`);
            setResults(response.data);
        } catch (error) {
            console.error("Search Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const sendBarterRequest = async (targetUser) => {
        if (!userId) {
            alert("Please login first!");
            return;
        }

        const myOffer = mySkills.length > 0 ? mySkills[0] : "General Assistance";

        const payload = {
            senderId: userId,
            receiverId: targetUser.id,
            skillRequested: searchQuery, 
            skillOffered: myOffer,
            status: "PENDING"
        };

        try {
            await axiosInstance.post('/requests/send', payload);
            // Add to sent tracking so we can change button UI
            setSentRequests([...sentRequests, targetUser.id]);
            alert(`Request sent to ${targetUser.name}!`);
        } catch (error) {
            console.error("Request Error:", error);
            alert("Failed to send request.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-black text-slate-900 mb-8">Browse Experts</h1>
                
                {/* Search Bar */}
                <form onSubmit={handleSearch} className="flex gap-3 mb-12">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-5 top-4.5 text-slate-400 w-6 h-6 group-focus-within:text-indigo-500 transition-colors" />
                        <input 
                            className="w-full pl-14 pr-6 py-4.5 rounded-[1.5rem] border-none shadow-xl shadow-indigo-100/50 outline-none focus:ring-2 focus:ring-indigo-500 text-lg font-medium"
                            placeholder="Find someone who knows..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-10 py-4.5 rounded-[1.5rem] font-black hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200 active:scale-95">
                        {loading ? <Loader2 className="animate-spin" /> : "Search"}
                    </button>
                </form>

                {/* Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {results.filter(u => u.id !== userId).map((u) => (
                        <div key={u.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">{u.name}</h3>
                                    <p className="text-slate-500 flex items-center gap-1.5 text-sm font-bold mt-1">
                                        <MapPin className="w-4 h-4 text-indigo-500" /> {u.location || "Global"}
                                    </p>
                                </div>
                                <div className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-2xl text-[10px] font-black uppercase">
                                    {u.karmaPoints} Points
                                </div>
                            </div>
                            
                            <div className="mb-8">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Skillset</p>
                                <div className="flex flex-wrap gap-2">
                                    {u.skillsOffered?.map(s => (
                                        <span key={s} className="bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold border border-slate-100">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* THE BARTER BUTTON */}
                            <button 
                                onClick={() => sendBarterRequest(u)}
                                disabled={sentRequests.includes(u.id)}
                                className={`w-full py-4 rounded-[1.25rem] font-black transition-all flex items-center justify-center gap-2 ${
                                    sentRequests.includes(u.id) 
                                    ? "bg-emerald-100 text-emerald-600 cursor-not-allowed" 
                                    : "bg-slate-900 text-white hover:bg-indigo-600 active:scale-95 shadow-lg shadow-slate-200"
                                }`}
                            >
                                {sentRequests.includes(u.id) ? (
                                    <><CheckCircle className="w-5 h-5" /> Request Sent</>
                                ) : (
                                    <><Send className="w-5 h-5" /> Send Barter Request</>
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Browse;