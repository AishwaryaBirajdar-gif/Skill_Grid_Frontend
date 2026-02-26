import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Check, X, Clock, ArrowRightLeft, User } from 'lucide-react';

const MyRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // ✅ Fix: Check both possible keys from your localStorage
    const userId = localStorage.getItem('userId') || localStorage.getItem('skillgrid_userId');

    useEffect(() => {
        if (userId) {
            fetchRequests();
        } else {
            console.error("DEBUG: No UserID found in LocalStorage. Check your Login process.");
            setLoading(false);
        }
    }, [userId]);

    const fetchRequests = async () => {
        try {
            console.log("DEBUG: Fetching requests for receiver:", userId);
            
            // This hits your @GetMapping("/my-requests/{userId}")
            const res = await axiosInstance.get(`/requests/my-requests/${userId}`);
            
            console.log("DEBUG: Data received from Backend:", res.data);
            setRequests(res.data);
        } catch (err) {
            console.error("DEBUG: Backend Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (requestId, action) => {
        try {
            // Hits your @PutMapping("/accept/{id}") or "/reject/{id}"
            const endpoint = `/requests/${action.toLowerCase()}/${requestId}`;
            await axiosInstance.put(endpoint);
            
            console.log(`DEBUG: Request ${requestId} was ${action}`);
            
            // Refresh list after action
            fetchRequests();
            alert(`Request ${action.toLowerCase()}ed!`);
        } catch (err) {
            console.error("DEBUG: Action failed", err);
            alert("Failed to update request status.");
        }
    };

    if (loading) return <div className="p-10 text-center font-bold text-indigo-600">Loading your inbox...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-black text-slate-800">My Barter Requests</h1>
                    <span className="bg-white px-4 py-2 rounded-full text-xs font-bold text-slate-400 border border-slate-200">
                        Logged in as: {userId?.substring(0, 8)}...
                    </span>
                </div>

                <div className="grid gap-6">
                    {requests.length > 0 ? (
                        requests.map((req) => (
                            <div key={req.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4">
                                    <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Incoming Request</p>
                                        <h3 className="text-sm font-bold text-slate-600">From ID: {req.senderId}</h3>
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
                                            <button 
                                                onClick={() => handleAction(req.id, 'ACCEPT')}
                                                className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-100"
                                            >
                                                <Check size={18} /> Accept
                                            </button>
                                            <button 
                                                onClick={() => handleAction(req.id, 'REJECT')}
                                                className="bg-white border-2 border-slate-100 hover:bg-rose-50 hover:border-rose-100 text-slate-400 hover:text-rose-500 px-5 py-3 rounded-xl font-bold transition-all"
                                            >
                                                <X size={18} />
                                            </button>
                                        </>
                                    ) : (
                                        <span className={`px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest ${
                                            req.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                        }`}>
                                            {req.status}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                            <Clock size={48} className="mx-auto text-slate-300 mb-4" />
                            <p className="text-slate-500 font-bold text-lg">Your Inbox is Empty</p>
                            <p className="text-slate-400 text-sm max-w-xs mx-auto">
                                When other users send you a barter request, it will appear here. Try logging in as a different user to send a request to yourself!
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyRequests;