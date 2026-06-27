
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ClipboardList, CheckCircle, Edit3, Lock, ShieldCheck, XCircle } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';

const ChatRoom = () => {
    const { requestId } = useParams();
    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');

    const [request, setRequest] = useState(null);
    const [reqInput, setReqInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axiosInstance.get(`/api/requests/${requestId}`);
                setRequest(res.data);
            } catch (err) {
                toast.error("Could not load room data.");
            }
        };
        fetchData();
    }, [requestId]);

    // --- Negotiation Logic ---
    const addMilestone = async () => {
        if (!reqInput) return;
        const isSender = userId === request.senderId;
        const payload = isSender 
            ? { senderRequirements: [...request.senderRequirements, reqInput] }
            : { receiverRequirements: [...request.receiverRequirements, reqInput] };
        
        try {
            const res = await axiosInstance.put(`/api/requests/${requestId}/propose-requirements`, payload);
            setRequest(res.data);
            setReqInput("");
        } catch (err) {
            toast.error("Failed to update requirements");
        }
    };

    const confirmTerms = async () => {
        try {
            const res = await axiosInstance.put(`/api/requests/${requestId}/approve-track?userId=${userId}`);
            setRequest(res.data);
            toast.success("Requirements Confirmed!");
        } catch (err) {
            toast.error("Action failed");
        }
    };

    // --- Progress (Stopper) Logic ---
    const handleSubmit = async () => {
        try {
            const res = await axiosInstance.put(`/api/requests/${requestId}/submit-work?userId=${userId}`);
            setRequest(res.data);
            toast.success("Progress Updated! Waiting for partner verification.");
        } catch (err) {
            toast.error(err.response?.data || "Submit error");
        }
    };

    const handleVerify = async () => {
        try {
            const res = await axiosInstance.put(`/api/requests/${requestId}/verify-work?verifierId=${userId}`);
            setRequest(res.data);
            toast.success("Partner's work verified!");
        } catch (err) {
            toast.error("Verification failed");
        }
    };

    if (!request) return <div className="h-screen bg-[#050510] flex items-center justify-center text-white">Loading...</div>;

    const isSender = userId === request.senderId;
    const myProgress = isSender ? request.senderProgress : request.receiverProgress;
    const partnerProgress = isSender ? request.receiverProgress : request.senderProgress;
    const myLock = isSender ? request.senderLocked : request.receiverLocked;
    const partnerLock = isSender ? request.receiverLocked : request.senderLocked;

    return (
        <div className="h-screen bg-[#050510] text-white flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#0a0a1a]">
                <h1 className="text-purple-400 font-bold flex items-center gap-2">
                    <ShieldCheck size={18} /> Skill Room
                </h1>
                <button onClick={() => navigate(-1)} className="text-red-400 text-sm hover:underline">Leave</button>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto">
                    <div className="flex-1">
                        {/* Chat messages would map here */}
                        <p className="text-slate-600 text-center text-xs uppercase tracking-widest mt-10">Conversation Secured</p>
                    </div>
                    
                    {/* Chat Input */}
                    <div className="flex gap-2 bg-[#0d0d21] p-2 rounded-lg border border-slate-800">
                        <input 
                            className="flex-1 bg-transparent px-4 py-2 outline-none" 
                            placeholder="Message..." 
                        />
                        <button className="bg-purple-600 p-2 rounded-lg hover:bg-purple-500 transition-all">
                            <Send size={20} />
                        </button>
                    </div>
                </div>

                {/* Sidebar: Negotiation & Stoppers */}
                <div className="w-80 border-l border-slate-800 bg-[#070715] p-5 flex flex-col gap-6 overflow-y-auto">
                    <div className="flex items-center gap-2 text-purple-400 font-bold mb-2">
                        <ClipboardList size={20} />
                        <h2>{request.status === 'ACTIVE' ? "Live Progress" : "Negotiation"}</h2>
                    </div>

                    {request.status === 'ACCEPTED' ? (
                        /* NEGOTIATION VIEW */
                        <div className="space-y-4">
                            <div className="p-3 bg-purple-900/10 border border-purple-500/30 rounded-lg">
                                <p className="text-[10px] text-purple-400 font-black uppercase mb-2">Your Requirements</p>
                                <ul className="text-xs space-y-1 mb-3">
                                    {(isSender ? request.senderRequirements : request.receiverRequirements).map((r, i) => (
                                        <li key={i} className="flex gap-2"><span>•</span>{r}</li>
                                    ))}
                                </ul>
                                <input 
                                    className="w-full bg-[#050510] border border-slate-700 text-xs p-2 rounded mb-2 outline-none focus:border-purple-500" 
                                    placeholder="Add milestone..."
                                    value={reqInput}
                                    onChange={(e) => setReqInput(e.target.value)}
                                />
                                <button onClick={addMilestone} className="w-full py-2 bg-purple-600 text-[10px] font-bold rounded hover:bg-purple-500 transition-all">
                                    UPDATE REQUIREMENTS
                                </button>
                            </div>

                            <button onClick={confirmTerms} className="w-full py-3 border border-emerald-500 text-emerald-400 text-xs font-bold rounded-lg hover:bg-emerald-500/10 transition-all">
                                CONFIRM & START BARTER
                            </button>
                            <button className="w-full py-3 border border-red-500 text-red-500 text-xs font-bold rounded-lg hover:bg-red-500/10">
                                REJECT BARTER
                            </button>
                        </div>
                    ) : (
                        /* PROGRESS (STOPPER) VIEW */
                        <div className="space-y-8">
                            {/* My Progress Bar */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                    <span>YOUR PROGRESS</span>
                                    <span>{myProgress}%</span>
                                </div>
                                <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                                    <div className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" style={{ width: `${myProgress}%` }}></div>
                                </div>
                            </div>

                            {/* Partner Progress Bar */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                    <span>PARTNER'S PROGRESS</span>
                                    <span>{partnerProgress}%</span>
                                </div>
                                <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                                    <div className="h-full bg-purple-500 shadow-[0_0_10px_#8b5cf6]" style={{ width: `${partnerProgress}%` }}></div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-3 pt-4">
                                <button 
                                    disabled={myLock || myProgress >= 100}
                                    onClick={handleSubmit}
                                    className={`py-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all 
                                        ${myLock ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}
                                >
                                    {myLock ? <Lock size={14}/> : <Send size={14}/>}
                                    {myLock ? "Waiting for Verification" : "Submit Work (20%)"}
                                </button>

                                <button 
                                    disabled={!partnerLock}
                                    onClick={handleVerify}
                                    className={`py-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all 
                                        ${!partnerLock ? 'border border-slate-800 text-slate-700' : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg'}`}
                                >
                                    <CheckCircle size={14}/>
                                    Verify Partner's Work
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatRoom;