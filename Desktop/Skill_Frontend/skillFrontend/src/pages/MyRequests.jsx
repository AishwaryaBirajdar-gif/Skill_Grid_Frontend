import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { Check, X, Clock, ArrowRightLeft, User, MessageSquare, Send } from 'lucide-react';

const MyRequests = () => {
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    
    const userId = localStorage.getItem('userId') || localStorage.getItem('skillgrid_userId');

    useEffect(() => {
        if (userId) {
            fetchAllRequests();
        } else {
            setLoading(false);
        }
    }, [userId]);

    const fetchAllRequests = async () => {
        try {
            setLoading(true);
            const [incomingRes, sentRes] = await Promise.all([
                axiosInstance.get(`/requests/my-requests/${userId}`),
                axiosInstance.get(`/requests/sent/${userId}`)
            ]);
            setIncomingRequests(incomingRes.data);
            setSentRequests(sentRes.data);
        } catch (err) {
            console.error("Error fetching requests", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (requestId, action) => {
        try {
            const endpoint = `/requests/${action.toLowerCase()}/${requestId}`;
            await axiosInstance.put(endpoint);
            fetchAllRequests();
            alert(`Request ${action.toLowerCase()}ed!`);
        } catch (err) {
            alert("Failed to update request status.");
        }
    };

    if (loading) return <div className="p-10 text-center font-bold text-indigo-600">Loading your requests...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-4xl mx-auto space-y-12">
                
                {/* SECTION 1: INCOMING */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600"><Clock size={20} /></div>
                        <h2 className="text-2xl font-black text-slate-800">Incoming Requests</h2>
                    </div>

                    <div className="grid gap-6">
                        {incomingRequests.length > 0 ? (
                            incomingRequests.map((req) => (
                                <div key={req.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600"><User size={24} /></div>
                                        <div>
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">From User</p>
                                            <h3 className="text-sm font-bold text-slate-600">{req.senderName || "Unknown User"}</h3>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
                                        <div className="text-center">
                                            <p className="text-[10px] font-black text-slate-400 uppercase">They Want</p>
                                            <p className="font-bold text-indigo-600">{req.skillRequested}</p>
                                        </div>
                                        <ArrowRightLeft className="text-slate-300" size={20} />
                                        <div className="text-center">
                                            <p className="text-[10px] font-black text-slate-400 uppercase">They Offer</p>
                                            <p className="font-bold text-emerald-600">{req.skillOffered}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        {req.status === 'PENDING' ? (
                                            <>
                                                <button onClick={() => handleAction(req.id, 'ACCEPT')} className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-100 transition-all">
                                                    <Check size={18} /> Accept
                                                </button>
                                                <button onClick={() => handleAction(req.id, 'REJECT')} className="bg-white border-2 border-slate-100 hover:bg-rose-50 hover:border-rose-100 text-slate-400 hover:text-rose-500 px-5 py-3 rounded-xl font-bold transition-all">
                                                    <X size={18} />
                                                </button>
                                            </>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <span className={`px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest ${req.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                    {req.status}
                                                </span>
                                                {/* ✅ Added Enter Room for Incoming Accepted Requests */}
                                                {req.status === 'ACCEPTED' && (
                                                    <button 
                                                        onClick={() => navigate(`/chat/${req.id}`)} 
                                                        className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 font-bold px-4"
                                                    >
                                                        <MessageSquare size={18} /> Chat
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400">No incoming requests.</div>
                        )}
                    </div>
                </section>

                <hr className="border-slate-200" />

                {/* SECTION 2: SENT */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Send size={20} /></div>
                        <h2 className="text-2xl font-black text-slate-800">Requests I've Sent</h2>
                    </div>

                    <div className="grid gap-6">
                        {sentRequests.length > 0 ? (
                            sentRequests.map((req) => (
                                <div key={req.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-blue-50 p-3 rounded-2xl text-blue-500"><User size={24} /></div>
                                        <div>
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Sent To</p>
                                            <h3 className="text-sm font-bold text-slate-600">{req.receiverName || "Unknown User"}</h3>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 bg-slate-50 px-6 py-3 rounded-2xl">
                                        <div className="text-center">
                                            <p className="text-[10px] font-black text-slate-400 uppercase">You Want</p>
                                            <p className="font-bold text-indigo-600">{req.skillRequested}</p>
                                        </div>
                                        <ArrowRightLeft className="text-slate-300" size={20} />
                                        <div className="text-center">
                                            <p className="text-[10px] font-black text-slate-400 uppercase">You Offered</p>
                                            <p className="font-bold text-emerald-600">{req.skillOffered}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <span className={`px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest ${req.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {req.status}
                                        </span>
                                        {/* ✅ Ensure Sent Requests also navigate to the correct path */}
                                        {req.status === 'ACCEPTED' && (
                                            <button 
                                                onClick={() => navigate(`/chat/${req.id}`)}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 transition-all"
                                            >
                                                <MessageSquare size={18} /> Enter Room
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400">You haven't sent any requests.</div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default MyRequests;