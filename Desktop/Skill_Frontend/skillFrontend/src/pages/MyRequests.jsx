import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import {
  Check,
  X,
  Clock,
  ArrowRightLeft,
  User,
  MessageSquare,
  Send,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const MyRequests = () => {
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const userId =
    localStorage.getItem('userId') ||
    localStorage.getItem('skillgrid_userId');

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
      // Fetching both ensures dashboard always reflects the latest negotiation state
      const [incomingRes, sentRes] = await Promise.all([
        axiosInstance.get(`/requests/my-requests/${userId}`),
        axiosInstance.get(`/requests/sent/${userId}`)
      ]);

      setIncomingRequests(incomingRes.data);
      setSentRequests(sentRes.data);
    } catch (err) {
      console.error("Error fetching requests", err);
      toast.error("Failed to sync dashboard.");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId, action) => {
    try {
      // Handles ACCEPT or REJECT actions
      const endpoint = `/requests/${action.toLowerCase()}/${requestId}`;
      await axiosInstance.put(endpoint);
      toast.success(`Request ${action.toLowerCase()}ed successfully!`);
      fetchAllRequests(); // Immediate refresh to show "Enter Room"
    } catch (err) {
      toast.error(`Failed to ${action.toLowerCase()} request.`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-bold text-indigo-600">Syncing your exchanges...</p>
        </div>
      </div>
    );
  }

  // Helper to determine if a Chat Room should be accessible
  const canEnterRoom = (status) => ['ACCEPTED', 'ACTIVE', 'COMPLETED'].includes(status);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto space-y-12">

        {/* SECTION 1: INCOMING */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
              <Clock size={20} />
            </div>
            <h2 className="text-2xl font-black text-slate-800">Incoming Requests</h2>
          </div>

          <div className="grid gap-6">
            {incomingRequests.length > 0 ? (
              incomingRequests.map((req) => (
                <div key={req.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600">
                      <User size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">From Learner</p>
                      <h3 className="text-sm font-bold text-slate-600">{req.senderName || "Unknown User"}</h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
                    <div className="text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase">They Want</p>
                      <p className="font-bold text-indigo-600">{req.skillRequested}</p>
                    </div>
                    <ArrowRightLeft className="text-slate-300" size={16} />
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
                        <button onClick={() => handleAction(req.id, 'REJECT')} className="bg-white border-2 border-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-500 px-4 py-3 rounded-xl transition-all">
                          <X size={18} />
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className={`px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest ${
                          canEnterRoom(req.status) ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {req.status}
                        </span>
                        {canEnterRoom(req.status) && (
                          <button onClick={() => navigate(`/chat/${req.id}`)} className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 font-bold px-4">
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
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
              <Send size={20} />
            </div>
            <h2 className="text-2xl font-black text-slate-800">Requests I've Sent</h2>
          </div>

          <div className="grid gap-6">
            {sentRequests.length > 0 ? (
              sentRequests.map((req) => (
                <div key={req.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-50 p-3 rounded-2xl text-blue-500">
                      <User size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sent To Expert</p>
                      <h3 className="text-sm font-bold text-slate-600">{req.receiverName || "Unknown User"}</h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 bg-slate-50 px-6 py-3 rounded-2xl">
                    <div className="text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase">You Want</p>
                      <p className="font-bold text-indigo-600">{req.skillRequested}</p>
                    </div>
                    <ArrowRightLeft className="text-slate-300" size={16} />
                    <div className="text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase">You Offered</p>
                      <p className="font-bold text-emerald-600">{req.skillOffered}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest ${
                      canEnterRoom(req.status) ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {req.status}
                    </span>
                    {canEnterRoom(req.status) && (
                      <button onClick={() => navigate(`/chat/${req.id}`)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 transition-all">
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