import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Sparkles, ArrowRightLeft, User, Send, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Suggestions = ({ user }) => { // ✅ Added user prop for better ID detection
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    
    // ✅ FIX: Robust ID detection checking both props and multiple localStorage keys
    const userId = user?.id || user?.userId || localStorage.getItem('userId') || localStorage.getItem('skillgrid_userId');

    useEffect(() => {
        const fetchMatches = async () => {
            // console.log("Current User ID for matching:", userId); // Debug log

            if (!userId || userId === "undefined" || userId === "null") {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                // Hits the smart matching endpoint in SuggestionController.java[cite: 39]
                const response = await axiosInstance.get(`/user/suggestions/${userId}`);
                setMatches(response.data);
            } catch (err) {
                console.error("Error fetching smart matches:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMatches();
    }, [userId]);

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <Sparkles className="text-amber-500 w-10 h-10" />
                        <h1 className="text-4xl font-black text-slate-800">Perfect Barter Matches</h1>
                    </div>
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="text-sm font-bold text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-xl transition-colors"
                    >
                        ← Back to Dashboard
                    </button>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                        <p className="text-slate-500 font-bold animate-pulse">Analyzing skill intersections...</p>
                    </div>
                ) : matches.length === 0 ? (
                    <div className="bg-white p-16 rounded-[3rem] text-center border-2 border-dashed border-slate-200 shadow-sm">
                        <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ArrowRightLeft className="text-slate-300 w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 mb-2">No perfect matches yet</h2>
                        <p className="text-slate-500 text-lg mb-8 max-w-md mx-auto">
                            We couldn't find a 1:1 barter partner right now. Make sure you have added <strong>"Skills I Want"</strong> in your profile!
                        </p>
                        <button 
                            onClick={() => navigate('/profile')} 
                            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                        >
                            Update My Skills →
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {matches.map(match => (
                            <div key={match.id} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-indigo-100 flex flex-col md:flex-row justify-between items-center gap-6 hover:translate-y-[-4px] transition-transform">
                                <div className="flex items-center gap-4">
                                    <div className="bg-indigo-600 p-4 rounded-2xl text-white shadow-lg shadow-indigo-100">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-800">{match.name}</h3>
                                        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest flex items-center gap-1">
                                            <MapPin size={12} className="text-indigo-400" /> {match.location || "Global Partner"}
                                        </p>
                                    </div>
                                </div>

                                {/* Visual Intersection of Skills[cite: 19, 59] */}
                                <div className="flex items-center gap-4 bg-slate-50 px-6 py-4 rounded-[1.5rem] border border-slate-100 flex-1 justify-center">
                                    <div className="text-center">
                                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter mb-1">They Teach</p>
                                        <p className="font-black text-slate-700 text-sm">
                                            {match.skillsOffered && match.skillsOffered.length > 0 ? match.skillsOffered[0].skillName : "Skill"}
                                        </p>
                                    </div>
                                    <ArrowRightLeft className="text-indigo-300 w-5 h-5 mx-2" />
                                    <div className="text-center">
                                        <p className="text-[9px] font-black text-emerald-400 uppercase tracking-tighter mb-1">You Teach</p>
                                        <p className="font-black text-slate-700 text-sm">
                                            {match.skillsWanted && match.skillsWanted.length > 0 ? match.skillsWanted[0].skillName : "Skill"}
                                        </p>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => navigate('/exchange-form', { 
                                        state: { 
                                            skill: { 
                                                name: match.skillsOffered[0].skillName, 
                                                postedBy: match 
                                            } 
                                        } 
                                    })}
                                    className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-indigo-600 transition-all shadow-lg active:scale-95"
                                >
                                    <Send size={18} /> Propose Barter
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// Simple icon component for location if not imported
const MapPin = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
);

export default Suggestions;