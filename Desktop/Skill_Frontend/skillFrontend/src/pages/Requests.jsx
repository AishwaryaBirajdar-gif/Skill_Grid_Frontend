import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Check, X, Clock, MessageSquare, Award } from 'lucide-react';

const Requests = () => {
    const [incoming, setIncoming] = useState([]);
    const [loading, setLoading] = useState(true);
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            // This hits the GET /api/requests/my-requests/{userId} endpoint we made
            const res = await axiosInstance.get(`/requests/my-requests/${userId}`);
            setIncoming(res.data);
        } catch (err) {
            console.error("Error fetching requests:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (requestId, status) => {
        try {
            if (status === 'ACCEPTED') {
                await axiosInstance.put(`/requests/accept/${requestId}`);
                alert("Barter Accepted! Connection Created.");
            }
            // Refresh the list
            fetchRequests();
        } catch (err) {
            alert("Error updating request.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-black text-slate-800 mb-8">Barter Inbox</h1>

                {loading ? (
                    <p>Loading requests...</p>
                ) : incoming.length === 0 ? (
                    <div className="bg-white p-10 rounded-[2rem] text-center border-2 border-dashed border-slate-200">
                        <p className="text-slate-400 font-bold">No incoming requests yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {incoming.map((req) => (
                            <div key={req.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="bg-indigo-100 p-3 rounded-2xl">
                                        <Award className="text-indigo-600 w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-800">
                                            Request for <span className="text-indigo-600">{req.skillRequested}</span>
                                        </p>
                                        <p className="text-sm text-slate-500 font-medium">
                                            They offer to teach you: <span className="font-bold text-slate-700">{req.skillOffered}</span>
                                        </p>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${req.status === 'ACCEPTED' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                            Status: {req.status}
                                        </span>
                                    </div>
                                </div>

                                {req.status === 'PENDING' && (
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleAction(req.id, 'ACCEPTED')}
                                            className="bg-emerald-500 text-white p-3 rounded-xl hover:bg-emerald-600 transition-all"
                                        >
                                            <Check className="w-5 h-5" />
                                        </button>
                                        <button className="bg-rose-50 text-rose-500 p-3 rounded-xl hover:bg-rose-100 transition-all">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Requests;