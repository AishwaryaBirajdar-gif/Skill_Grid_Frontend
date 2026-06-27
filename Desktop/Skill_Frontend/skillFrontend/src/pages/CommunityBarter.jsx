import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import axiosInstance from '../api/axiosInstance'; 
import { createCommunityBarter, getAllCommunityCircles, detectCommunityLoops } from '../api/communityService';

export default function CommunityBarter() {
    const navigate = useNavigate(); 
    
    const [circles, setCircles] = useState([]);
    const [suggestedLoops, setSuggestedLoops] = useState([]); // ✅ NEW: Holds loops populated with readable names
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    // Retrieve the currently logged-in user details from localStorage
    const currentUserId = localStorage.getItem('userId') || localStorage.getItem('skillgrid_userId');

    // Fetch all available groups and check loops on mount
    useEffect(() => {
        fetchCircles();
        fetchSmartLoops();
    }, []);

    const fetchCircles = async () => {
        try {
            const data = await getAllCommunityCircles();
            setCircles(data);
        } catch (error) {
            console.error("Error fetching community pools:", error);
        }
    };

    // ✅ NEW: Fetches loops and dynamically resolves user IDs into their real usernames
    const fetchSmartLoops = async () => {
        try {
            const rawLoops = await detectCommunityLoops();
            if (!rawLoops || rawLoops.length === 0) return;

            const resolvedLoops = await Promise.all(
                rawLoops.map(async (loopArray) => {
                    // Dedup elements to prevent looking up the starting node twice (e.g. A -> B -> C -> A)
                    const uniqueIds = Array.from(new Set(loopArray));
                    
                    const nameMapPromises = uniqueIds.map(async (uId) => {
                        try {
                            const res = await axiosInstance.get(`/user/${uId}`);
                            return { id: uId, name: res.data.name || `User ${uId.substring(0, 5)}` };
                        } catch {
                            return { id: uId, name: `User ${uId.substring(0, 5)}` };
                        }
                    });
                    
                    const resolvedUsers = await Promise.all(nameMapPromises);
                    
                    // Reconstruct the sequential string path loop for the UI layout display
                    return loopArray.map(id => {
                        const match = resolvedUsers.find(u => u.id === id);
                        return match ? match.name : `User ${id.substring(0, 5)}`;
                    });
                })
            );

            setSuggestedLoops(resolvedLoops);
        } catch (error) {
            console.error("Graph trade loop discovery evaluation failed:", error);
        }
    };

    const handleCreateCircle = async (e) => {
        e.preventDefault();
        if (!currentUserId) {
            alert("Please log in to create a barter circle!");
            return;
        }

        setLoading(true);
        try {
            await createCommunityBarter(title, description, currentUserId);
            alert("🎉 Community Barter Circle launched successfully!");
            setTitle('');
            setDescription('');
            fetchCircles(); 
        } catch (error) {
            console.error("Error creating circle:", error);
            alert("Failed to create barter circle.");
        } finally {
            setLoading(false);
        }
    };

    // ✅ NEW: Pre-fills configuration state values from suggested matching combinations instantly
    const handleTriggerAutoFill = (loopNames) => {
        const uniqueNames = Array.from(new Set(loopNames));
        setTitle(`Circle: ${uniqueNames.slice(0, 2).join(' & ')} Collective`);
        setDescription(`A smart circular trade cluster auto-detected for participants: ${uniqueNames.join(', ')}.`);
        // Smoothly scrolls user back over to creation form card anchor
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleRequestJoinCircle = async (barterId) => {
        if (!currentUserId) {
            alert("Please log in to submit an admission request!");
            return;
        }

        try {
            await axiosInstance.post(`/community-barter/request-join/${barterId}?userId=${currentUserId}`);
            alert("🤝 Membership application submitted successfully! Please wait for the creator's approval.");
            await fetchCircles(); 
        } catch (error) {
            console.error("Error submitting join request:", error);
            alert("Could not process request to join or you have already submitted an application.");
        }
    };

    // FORCE RE-SHAPING UTILITY: Safely flattens nested maps, Sets, or Objects into true native Arrays
    const normalizeToIdArray = (dataField) => {
        if (!dataField) return [];
        if (Array.isArray(dataField)) return dataField;
        if (dataField.values && Array.isArray(dataField.values)) return dataField.values;
        if (typeof dataField === 'object') return Object.values(dataField);
        return [];
    };

    return (
        <div className="p-6 max-w-6xl mx-auto min-h-screen bg-gray-50 font-sans">
            <header className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-800">🏛️ Community Barter Hub</h1>
                <p className="text-gray-600 mt-2">
                    Step beyond 1-on-1 swaps. Join collective networks to exchange skills multi-directionally within a circle!
                </p>
            </header>

            {/* ✅ NEW PANEL: GLOWING SMART GRAPH MATCH SUGGESTIONS */}
            {suggestedLoops.length > 0 && (
                <div className="mb-8 bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-indigo-500/20 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                        <h2 className="text-xl font-black tracking-wide">✨ AI Barter Matches Detected</h2>
                    </div>
                    <p className="text-indigo-200 text-xs mb-4 max-w-2xl">
                        Our graph network engine analyzed user requirements and discovered complete multi-directional demand loops! Select a match to instantly spin up an approved collective.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {suggestedLoops.map((loop, idx) => (
                            <div key={idx} className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10 flex flex-col justify-between hover:border-indigo-400/30 transition">
                                <div className="flex items-center flex-wrap gap-1.5 text-xs font-bold text-slate-100">
                                    {loop.map((name, nameIdx) => (
                                        <React.Fragment key={nameIdx}>
                                            <span className="bg-indigo-500/20 border border-indigo-400/20 px-2.5 py-1 rounded-lg text-[11px]">
                                                {name}
                                            </span>
                                            {nameIdx < loop.length - 1 && <span className="text-indigo-400 font-extrabold">➔</span>}
                                        </React.Fragment>
                                    ))}
                                </div>
                                <button 
                                    onClick={() => handleTriggerAutoFill(loop)}
                                    className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-wider py-2 px-3 rounded-lg transition self-end shadow-sm"
                                >
                                    Form Barter Circle
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side: Create Form */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
                    <h2 className="text-xl font-bold mb-4 text-indigo-900">Start a Collective</h2>
                    <form onSubmit={handleCreateCircle} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Circle Name</label>
                            <input 
                                type="text" 
                                value={title} 
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Full-Stack Web Dev & UI Design" 
                                className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Description / Focus</label>
                            <textarea 
                                value={description} 
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What skills are needed? What is the goal of this barter pool?" 
                                className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none text-sm transition"
                                required
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white font-medium py-2 rounded-lg hover:bg-indigo-700 transition shadow-xs text-sm font-bold"
                        >
                            {loading ? "Creating..." : "Launch Circle"}
                        </button>
                    </form>
                </div>

                {/* Right Side: Active Circles Board */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-bold text-slate-800">Active Barter Pools ({circles.length})</h2>
                    
                    {circles.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed text-gray-500 text-sm">
                            No community barter pools are active right now. Be the first to start one!
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {circles.map((circle) => {
                                const participantList = normalizeToIdArray(circle.participantIds);
                                const pendingList = normalizeToIdArray(circle.pendingRequestIds);

                                const isMember = participantList.includes(currentUserId) || circle.creatorId === currentUserId;
                                const isPending = pendingList.includes(currentUserId);

                                return (
                                    <div key={circle._id || circle.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-base text-slate-800 truncate max-w-[170px]">{circle.title}</h3>
                                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tight">
                                                    {circle.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600 mb-4 line-clamp-3 leading-relaxed">{circle.description}</p>
                                            <div className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-1 rounded-md w-fit mb-3 border border-indigo-100/50">
                                                👑 Creator: {circle.creatorName || "Circle Lead"}
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-gray-500">
                                                    👥 {participantList.length} Members
                                                </span>
                                            </div>
                                            
                                            {isMember ? (
                                                <div className="flex flex-col gap-2 w-full">
                                                    <span className="bg-indigo-50 text-indigo-700 text-[11px] font-bold px-3 py-1.5 rounded-lg text-center border border-indigo-100">
                                                        ✓ Access Approved
                                                    </span>
                                                    <button 
                                                        onClick={() => navigate(`/community-room/${circle._id || circle.id}`)}
                                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold py-2 rounded-lg transition uppercase tracking-wider shadow-2xs"
                                                    >
                                                        💬 Open Swap Room
                                                    </button>
                                                </div>
                                            ) : isPending ? (
                                                <button 
                                                    disabled
                                                    className="w-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold py-2.5 rounded-lg cursor-not-allowed"
                                                >
                                                    ⏳ Approval Pending...
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => handleRequestJoinCircle(circle._id || circle.id)}
                                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold py-2.5 rounded-lg transition uppercase tracking-wider shadow-2xs"
                                                >
                                                    🔒 Request to Join
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}