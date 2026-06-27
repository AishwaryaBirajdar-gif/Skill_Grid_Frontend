import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Landmark, Send, ArrowLeft, User as UserIcon, ShieldAlert, Check, X } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import SockJS from "sockjs-client";
import Stomp from "stompjs"; 

export default function CommunityRoom() {
    const { barterId } = useParams();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [circleDetails, setCircleDetails] = useState(null);
    const [pendingProfiles, setPendingProfiles] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

    const currentUserId = localStorage.getItem('userId') || localStorage.getItem('skillgrid_userId');
    const userName = localStorage.getItem('userName') || "Peer";
    const stompClientRef = useRef(null);
    const chatEndRef = useRef(null);

    // Helper utility to safely convert map/nested structures into primitive arrays
    const cleanIdArray = (dataField) => {
        if (!dataField) return [];
        if (Array.isArray(dataField)) return dataField;
        if (dataField.values && Array.isArray(dataField.values)) return dataField.values;
        if (typeof dataField === 'object') return Object.values(dataField);
        return [];
    };

    // 1. Sync room details, resolve member profiles, enforce guard limits, and fetch message history
    useEffect(() => {
        const fetchRoomData = async () => {
            try {
                // 1. Fetch the master active community pools list
                const res = await axiosInstance.get('/community-barter/all');
                const matched = res.data.find(c => (c.id === barterId || c._id === barterId));
                
                if (!matched) {
                    alert("The requested community circle trading floor does not exist.");
                    navigate('/community-barter');
                    return;
                }

                // Normalizing structural states using defensive utilities
                const approvedParticipants = cleanIdArray(matched.participantIds);
                const pendingRequests = cleanIdArray(matched.pendingRequestIds);

                // 🛡️ SECURITY GUARD: Block entry if current user isn't an approved member or the creator
                const isApprovedMember = approvedParticipants.includes(currentUserId);
                const isCreator = matched.creatorId === currentUserId;

                if (!isApprovedMember && !isCreator) {
                    alert("Access Denied: You must submit a membership admission request and be approved by the creator to enter this circle.");
                    navigate('/community-barter');
                    return;
                }

                // 2. Pre-fetch actual database profiles for every participant id to reveal usernames
                if (approvedParticipants.length > 0) {
                    const profilePromises = approvedParticipants.map(async (pId) => {
                        try {
                            const userRes = await axiosInstance.get(`/user/${pId}`);
                            return { id: pId, name: userRes.data.name || `User ${pId.substring(0, 5)}` };
                        } catch (err) {
                            return { id: pId, name: `User ${pId.substring(0, 5)}` };
                        }
                    });
                    const resolvedMembers = await Promise.all(profilePromises);
                    matched.memberProfiles = resolvedMembers; 
                }

                // 3. Resolve pending application user names for the Creator Management Panel view
                if (isCreator && pendingRequests.length > 0) {
                    const pendingPromises = pendingRequests.map(async (pId) => {
                        try {
                            const userRes = await axiosInstance.get(`/user/${pId}`);
                            return { id: pId, name: userRes.data.name || `User ${pId.substring(0, 5)}` };
                        } catch (err) {
                            return { id: pId, name: `User ${pId.substring(0, 5)}` };
                        }
                    });
                    const resolvedPending = await Promise.all(pendingPromises);
                    setPendingProfiles(resolvedPending);
                }

                setCircleDetails(matched);

                // 4. Fetch message history
                const msgHistoryRes = await axiosInstance.get(`/requests/messages/${barterId}`);
                if (msgHistoryRes.data) {
                    if (Array.isArray(msgHistoryRes.data)) {
                        setMessages(msgHistoryRes.data);
                    } else if (msgHistoryRes.data.messages && Array.isArray(msgHistoryRes.data.messages)) {
                        setMessages(msgHistoryRes.data.messages);
                    }
                }
            } catch (err) {
                console.error("Failed to sync room context history securely:", err);
            }
        };
        fetchRoomData();
    }, [barterId, navigate, currentUserId]);

    // 2. Manage WebSockets using Stomp / SockJS
    useEffect(() => {
        const socket = new SockJS('/api/ws');
        const stompClient = Stomp.over(socket);

        stompClient.debug = () => {};

        stompClient.connect({}, () => {
            stompClientRef.current = stompClient;
            
            stompClient.subscribe(`/topic/community/${barterId}`, (response) => {
                const incomingMessage = JSON.parse(response.body);
                setMessages((prev) => {
                    if (prev.some(m => m.timestamp === incomingMessage.timestamp && m.content === incomingMessage.content)) {
                        return prev;
                    }
                    return [...prev, incomingMessage];
                });
            });
        }, (err) => {
            console.error("STOMP connection error:", err);
        });

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.disconnect();
            }
        };
    }, [barterId]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const chatPayload = {
            senderId: currentUserId,
            sender: userName,
            content: input.trim(),
            timestamp: new Date().toISOString()
        };

        setMessages((prev) => [...prev, chatPayload]);
        setInput('');

        try {
            await axiosInstance.post(`/requests/messages/${barterId}/save`, chatPayload);
        } catch (err) {
            console.error("Database persistence backup failed:", err);
        }

        if (stompClientRef.current && stompClientRef.current.connected) {
            stompClientRef.current.send(`/app/sendCommunityMessage/${barterId}`, {}, JSON.stringify(chatPayload));
        }
    };

    // 3. Process application workflows to admit or drop candidates
    const handleProcessAdmission = async (applicantId, approve) => {
        try {
            // ✅ MATCHES UPDATED CONTROLLER: Dynamic PathVariable structural sequence mapping
            await axiosInstance.post(
                `/community-barter/process-request/${barterId}?creatorId=${currentUserId}&applicantId=${applicantId}&approve=${approve}`
            );
            
            // Clean up UI local states immediately for a highly responsive feel
            setPendingProfiles(prev => prev.filter(p => p.id !== applicantId));
            if (approve) {
                const addedUser = pendingProfiles.find(p => p.id === applicantId);
                if (addedUser && circleDetails) {
                    setCircleDetails(prev => ({
                        ...prev,
                        memberProfiles: [...(prev.memberProfiles || []), addedUser]
                    }));
                }
            }
        } catch (err) {
            console.error("Failed to alter admission queue status state:", err);
            alert("Error running review action processing.");
        }
    };

    const handleViewProfile = async (userObj) => {
        const targetId = userObj.id || userObj._id;
        if (!targetId) {
            alert("Unable to load profile: Missing identification references.");
            return;
        }

        try {
            const res = await axiosInstance.get(`/user/${targetId}`);
            setSelectedUser(res.data);
        } catch (err) {
            console.error("Could not fetch user profile details from backend:", err);
            setSelectedUser(userObj); 
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative">
            <nav className="bg-white border-b p-4 flex items-center justify-between shadow-sm">
                <button onClick={() => navigate('/community-barter')} className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-bold text-sm">
                    <ArrowLeft size={18} /> Back to Hub
                </button>
                <div className="text-center">
                    <h2 className="font-black text-xl text-slate-800">{circleDetails?.title || "Community Room"}</h2>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Collective Trading Floor</p>
                </div>
                <div className="w-24"></div>
            </nav>

            <div className="flex-1 max-w-7xl w-full mx-auto grid grid-cols-1 md:grid-cols-4 p-6 gap-6">
                
                {/* Left Panel: Creator Tools & Active Member Matrix */}
                <div className="flex flex-col gap-4 h-fit">
                    
                    {/* ⚙️ CREATOR MANAGEMENT DASHBOARD PANEL */}
                    {circleDetails?.creatorId === currentUserId && pendingProfiles.length > 0 && (
                        <div className="bg-amber-50/80 backdrop-blur-xs p-4 rounded-2xl border border-amber-200 shadow-sm space-y-3 animate-in fade-in slide-in-from-top-4 duration-200">
                            <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                                <ShieldAlert size={15} className="text-amber-600" /> Join Requests ({pendingProfiles.length})
                            </h4>
                            <div className="space-y-2 max-h-[22vh] overflow-y-auto pr-1">
                                {pendingProfiles.map((member) => (
                                    <div key={member.id} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-amber-100 shadow-2xs">
                                        <span className="font-bold text-slate-700 text-xs truncate max-w-[110px]">{member.name}</span>
                                        <div className="flex gap-1">
                                            <button 
                                                onClick={() => handleProcessAdmission(member.id, true)}
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white p-1 rounded-md transition"
                                                title="Approve Member"
                                            >
                                                <Check size={14} />
                                            </button>
                                            <button 
                                                onClick={() => handleProcessAdmission(member.id, false)}
                                                className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-1 rounded-md transition"
                                                title="Reject Request"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Active Trading Circle Members */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                        <h3 className="font-bold text-sm text-indigo-900 uppercase tracking-wider flex items-center gap-2">
                            <Landmark size={16} /> Circle Matrix
                        </h3>
                        <p className="text-xs text-slate-500">Click on any peer participant to review their offered skills portfolio.</p>
                        <div className="divide-y divide-gray-100 max-h-[40vh] overflow-y-auto">
                            {circleDetails?.memberProfiles?.map((member, idx) => (
                                <div 
                                    key={idx} 
                                    onClick={() => handleViewProfile({ id: member.id, _id: member.id, name: member.name })}
                                    className="py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 rounded-lg px-2 transition group"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-sm font-black text-slate-700 group-hover:text-indigo-600 transition">
                                            {member.id === currentUserId ? `${userName} (You)` : member.name}
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-tight bg-indigo-50 px-2 py-0.5 rounded group-hover:bg-indigo-100 transition">View Info</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Chat Floor */}
                <div className="md:col-span-3 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col overflow-hidden h-[75vh]">
                    <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
                        {messages.length === 0 ? (
                            <div className="text-center text-sm text-gray-400 my-auto py-12">
                                Welcome to the circle group chat! Introduce yourself, offer your skills, and pitch a multi-directional barter contract.
                            </div>
                        ) : (
                            messages.map((msg, i) => {
                                const isMe = msg.senderId === currentUserId || msg.sender === userName;
                                return (
                                    <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                        <div className="text-xs text-gray-400 mb-1 font-bold">{msg.sender}</div>
                                        <div className={`p-3 rounded-2xl max-w-md text-sm font-medium shadow-sm ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border'}`}>
                                            {msg.content}
                                        </div>
                                        <div className="text-[9px] text-gray-400 mt-0.5">
                                            {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} className="p-4 bg-white border-t flex gap-2">
                        <input 
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Propose a skill exchange arrangement..."
                            className="flex-1 border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <button type="submit" className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 transition">
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            </div>

            {/* Profile Pop-up Dialog Modal Box */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[2.5rem] max-w-md w-full p-8 border shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4 border">
                                <UserIcon size={30} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 mb-1">{selectedUser.name || "User Profile"}</h3>
                            <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-4 bg-amber-50 px-3 py-1 rounded-full">
                                {selectedUser.karmaPoints !== undefined ? selectedUser.karmaPoints : 100} KP
                            </p>
                            
                            <div className="w-full space-y-4 text-left border-t pt-4">
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Skills Offering:</h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedUser.skillsOffered && selectedUser.skillsOffered.length > 0 ? (
                                            selectedUser.skillsOffered.map((s, idx) => (
                                                <span key={idx} className="bg-emerald-50 text-emerald-700 text-[11px] font-semibold px-2.5 py-1 rounded-md border border-emerald-100">
                                                    {typeof s === 'string' ? s : s.skillName || JSON.stringify(s)}
                                                </span>
                                            ))
                                        ) : <span className="text-xs text-gray-400 italic">No declared offering portfolio.</span>}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Skills Desired:</h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedUser.skillsWanted && selectedUser.skillsWanted.length > 0 ? (
                                            selectedUser.skillsWanted.map((s, idx) => (
                                                <span key={idx} className="bg-rose-50 text-rose-700 text-[11px] font-semibold px-2.5 py-1 rounded-md border border-rose-100">
                                                    {typeof s === 'string' ? s : s.skillName || JSON.stringify(s)}
                                                </span>
                                            ))
                                        ) : <span className="text-xs text-gray-400 italic">No desired requirements listed.</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => setSelectedUser(null)}
                            className="mt-6 w-full bg-slate-800 text-white font-medium py-2 rounded-xl hover:bg-slate-900 transition"
                        >
                            Close Profile
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}