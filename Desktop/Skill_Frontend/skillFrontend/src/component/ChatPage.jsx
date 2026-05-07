import React, { useEffect, useRef, useState } from "react";
import { MdSend } from "react-icons/md";
import { 
  ClipboardList, CheckCircle, Loader2, Send, X, 
  RotateCcw, AlertCircle, Coins, ThumbsUp, PartyPopper, Star
} from "lucide-react";
import useChatContext from "../context/ChatContext";
import { useNavigate, useParams } from "react-router-dom";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import toast from "react-hot-toast";
import { baseURL } from "../config/AxiosHelper";
import axiosInstance from "../api/axiosInstance";

const ChatPage = () => {
  const { requestId } = useParams();
  const { currentUser } = useChatContext(); 
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [requestData, setRequestData] = useState(null);
  const [newReq, setNewReq] = useState("");
  const [localReqs, setLocalReqs] = useState([]); 
  const chatBoxRef = useRef(null);
  const stompClientRef = useRef(null);

  // ✅ Retrieve Local User ID for strict message alignment
  const currentUserId = localStorage.getItem("userId") || localStorage.getItem("skillgrid_userId");

  const fetchRoom = async () => {
    try {
      const res = await axiosInstance.get(`/requests/${requestId}`);
      if (res.data) {
        setRequestData(res.data);
        if (res.data.messages) {
          setMessages(res.data.messages);
        }
      }
    } catch (e) { 
      console.error("Sync Error", e); 
    }
  };

  useEffect(() => {
    if (requestId) fetchRoom();
    
    const socketFactory = () => new SockJS(`${baseURL}/chat`);
    const client = Stomp.over(socketFactory);
    
    client.connect({}, () => {
      stompClientRef.current = client;
      client.subscribe(`/topic/room/${requestId}`, (m) => {
        const newMessage = JSON.parse(m.body);
        setMessages(prev => {
          const exists = prev.find(msg => 
            msg.timestamp === newMessage.timestamp && 
            msg.content === newMessage.content && 
            msg.senderId === newMessage.senderId
          );
          return exists ? prev : [...prev, newMessage];
        });
        fetchRoom(); // Keeps roadmap progress synced across users
      });
    });

    return () => { 
      if (stompClientRef.current) stompClientRef.current.disconnect(); 
    };
  }, [requestId]);

  const sendMessage = () => {
    if (!input.trim() || !stompClientRef.current) return;
    
    const chatMessage = { 
        sender: currentUser, 
        senderId: currentUserId, // ✅ CRITICAL: Sending ID for alignment
        content: input, 
        roomId: requestId,
        timestamp: new Date().toISOString() 
    };
    
    stompClientRef.current.send(`/app/sendMessage/${requestId}`, {}, JSON.stringify(chatMessage));
    setInput("");
  };

  const addLocalRequirement = () => {
    if (!newReq.trim()) return;
    setLocalReqs([...localReqs, newReq]);
    setNewReq("");
  };

  const removeLocalRequirement = (index) => {
    setLocalReqs(localReqs.filter((_, i) => i !== index));
  };

  const handleFinalSubmit = async (type) => {
    if (localReqs.length === 0) {
      toast.error("Add at least one goal first!");
      return;
    }
    const payload = type === 'sender' ? { senderRequirements: localReqs } : { receiverRequirements: localReqs };
    try {
      const res = await axiosInstance.put(`/requests/${requestId}/propose-requirements`, payload);
      setRequestData(res.data);
      setLocalReqs([]); 
      toast.success("Goals submitted!");
      fetchRoom();
    } catch (e) { toast.error("Submission failed."); }
  };

  const handleSendBack = async (track) => {
    try {
      const res = await axiosInstance.put(`/requests/${requestId}/send-back?trackType=${track}`);
      setRequestData(res.data);
      toast.success("Changes requested from partner!");
      fetchRoom();
    } catch (e) { toast.error("Action failed."); }
  };

  const handleApprove = async (trackType) => {
    try {
        const res = await axiosInstance.put(`/requests/${requestId}/approve-track?userId=${currentUserId}&trackType=${trackType}`);
        if (res.data) {
            setRequestData(res.data);
            toast.success("Section Approved!");
            fetchRoom(); 
        }
    } catch (e) { toast.error("Approval failed."); }
  };

  const handleVerify = async () => {
    try {
        await axiosInstance.put(`/requests/${requestId}/verify-work?verifierId=${currentUserId}`);
        toast.success("Work verified!");
        fetchRoom();
    } catch (e) { toast.error("Verification failed."); }
  };

  const isSender = currentUserId === requestData?.senderId; 
  const isReceiver = currentUserId === requestData?.receiverId; 
  const isKarmaBarter = requestData?.skillOffered === "KARMA_PAYMENT";
  const isCompleted = requestData?.senderProgress === 100 && requestData?.receiverProgress === 100;

  useEffect(() => {
    if (chatBoxRef.current) chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
  }, [messages]);

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden font-sans">
      {/* LEFT: CHAT AREA */}
      <div className="flex-1 flex flex-col border-r border-gray-800">
        <header className="p-4 border-b border-gray-800 flex justify-between items-center bg-black/20">
          <h1 className="font-bold text-purple-400 uppercase tracking-tighter">SkillGrid Room</h1>
          <button onClick={() => navigate("/my-requests")} className="text-[10px] font-black uppercase text-gray-500 hover:text-red-500">Leave Room</button>
        </header>
        
        <main ref={chatBoxRef} className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((m, i) => {
            // ✅ FINAL ALIGNMENT CHECK: Compare IDs as strings
            const isMe = String(m.senderId) === String(currentUserId);
            
            return (
              <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"} w-full animate-in fade-in slide-in-from-bottom-2`}>
                <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[75%]`}>
                  <p className="text-[9px] font-black mb-1 opacity-40 uppercase px-1 tracking-widest">
                    {isMe ? "You" : m.sender}
                  </p>
                  <div className={`p-3 rounded-2xl text-sm shadow-md ${
                    isMe 
                      ? "bg-purple-600 text-white rounded-tr-none border border-purple-500/50" 
                      : "bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700/50"
                  }`}>
                    {m.content}
                  </div>
                </div>
              </div>
            );
          })}
        </main>

        <footer className="p-4 border-t border-gray-800 flex gap-2 bg-black/20">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()} className="flex-1 bg-gray-900 p-3 rounded-xl border border-gray-800 outline-none focus:border-purple-500 text-sm" placeholder="Type a message..." />
          <button onClick={sendMessage} className="bg-purple-600 p-3 rounded-xl hover:bg-purple-500 transition-all shadow-lg"><MdSend size={20}/></button>
        </footer>
      </div>

      {/* RIGHT: SIDEBAR (Roadmaps) */}
      <aside className="w-96 p-6 bg-gray-900/20 overflow-y-auto border-l border-gray-800">
        <h2 className="flex gap-2 font-bold mb-6 items-center uppercase tracking-tighter">
            <ClipboardList className="text-purple-400" size={18}/> Roadmap & Progress
        </h2>
        
        {!requestData ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-purple-500" /></div> : (
          <div className="space-y-6">
            
            {/* 🏆 COMPLETION VIEW */}
            {isCompleted ? (
              <div className="flex flex-col items-center justify-center py-10 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl animate-in zoom-in text-center px-4">
                  <PartyPopper size={50} className="text-emerald-400 mb-4 animate-bounce" />
                  <h3 className="text-lg font-black uppercase text-emerald-400">Exchange Complete!</h3>
                  <button onClick={() => navigate("/")} className="mt-6 w-full bg-white text-black py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Return Home</button>
              </div>
            ) : requestData.status === "ACTIVE" ? (
              <div className="space-y-8 animate-in fade-in duration-500">
                  {/* Track 1: Receiver Progress */}
                  <div className="p-4 bg-gray-900 border border-emerald-500/30 rounded-2xl shadow-xl">
                    <div className="flex justify-between items-center mb-4 text-[10px] font-black uppercase">
                        <span className="text-emerald-400">{requestData.receiverProgress}%</span>
                        <p>{requestData.receiverName}'s Roadmap</p>
                    </div>
                    <div className="h-2 bg-gray-800 mb-6 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 transition-all duration-700 shadow-[0_0_10px_#10b981]" style={{width: `${requestData.receiverProgress}%`}}></div>
                    </div>
                    <div className="space-y-3">
                        {requestData.receiverRequirements?.map((req, index) => {
                            const total = requestData.receiverRequirements.length || 1;
                            const isDone = requestData.receiverProgress >= ((index + 1) / total) * 100;
                            const isCurrent = !isDone && (requestData.receiverProgress >= (index / total) * 100);
                            return (
                                <div key={index} className={`p-3 rounded-xl border transition-all ${isDone ? 'border-emerald-500/30 bg-emerald-500/5 opacity-60' : isCurrent ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_10px_rgba(168,85,247,0.2)]' : 'border-gray-800 bg-gray-800/20'}`}>
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs font-bold">{req}</p>
                                        {isCurrent && (
                                            isReceiver ? <button onClick={()=>axiosInstance.put(`/requests/${requestId}/submit-work?userId=${currentUserId}`).then(fetchRoom)} className="px-3 py-1 bg-emerald-600 text-[9px] font-black uppercase rounded-lg">SUBMIT</button>
                                            : requestData.receiverLocked && <button onClick={handleVerify} className="px-3 py-1 bg-purple-600 text-[9px] font-black uppercase rounded-lg">VERIFY</button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                  </div>

                  {/* Track 2: Sender Progress */}
                  {!isKarmaBarter && (
                    <div className="p-4 bg-gray-900 border border-purple-500/30 rounded-2xl shadow-xl">
                      <div className="flex justify-between items-center mb-4 text-[10px] font-black uppercase">
                          <span className="text-purple-400">{requestData.senderProgress}%</span>
                          <p>{requestData.senderName}'s Roadmap</p>
                      </div>
                      <div className="h-2 bg-gray-800 mb-6 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 transition-all duration-700 shadow-[0_0_10px_#a855f7]" style={{width: `${requestData.senderProgress}%`}}></div>
                      </div>
                      <div className="space-y-3">
                          {requestData.milestones?.map((m, index) => {
                              const total = requestData.milestones.length || 1;
                              const isDone = requestData.senderProgress >= ((index + 1) / total) * 100;
                              const isCurrent = !isDone && (requestData.senderProgress >= (index / total) * 100);
                              return (
                                  <div key={index} className={`p-3 rounded-xl border transition-all ${isDone ? 'border-purple-500/30 bg-purple-500/5 opacity-60' : isCurrent ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'border-gray-800 bg-gray-800/20'}`}>
                                      <div className="flex justify-between items-center">
                                          <p className="text-xs font-bold">{m.title}</p>
                                          {isCurrent && (
                                              isSender ? <button onClick={()=>axiosInstance.put(`/requests/${requestId}/submit-work?userId=${currentUserId}`).then(fetchRoom)} className="px-3 py-1 bg-purple-600 text-[9px] font-black uppercase rounded-lg">SUBMIT</button>
                                              : requestData.senderLocked && <button onClick={handleVerify} className="px-3 py-1 bg-emerald-600 text-[9px] font-black uppercase rounded-lg">VERIFY</button>
                                          )}
                                      </div>
                                  </div>
                              );
                          })}
                      </div>
                    </div>
                  )}
              </div>
            ) : requestData.status === "ACCEPTED" ? (
              <div className="space-y-6">
                {/* TEACHER SENDER TRACK */}
                {!isKarmaBarter && (
                    <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-900/5">
                        <p className="text-[10px] font-black text-purple-400 mb-1 uppercase tracking-widest">Teacher: {requestData.senderName}</p>
                        {isReceiver && (!requestData.milestones?.length || requestData.senderReqNeedsUpdate) && (
                            <div className="space-y-2">
                                <input value={newReq} onChange={e=>setNewReq(e.target.value)} placeholder="Propose goal..." className="w-full bg-gray-900 p-2 text-xs rounded border border-gray-700 outline-none"/>
                                <button onClick={addLocalRequirement} className="w-full bg-purple-600 text-[10px] py-1 rounded font-bold uppercase tracking-widest">Add Goal</button>
                                <button onClick={()=>handleFinalSubmit('sender')} className="w-full bg-white text-black text-[10px] py-1 rounded font-black uppercase tracking-widest">Submit Plan</button>
                            </div>
                        )}
                        {requestData.milestones?.length > 0 && (
                            <div className="space-y-1 mt-2">
                                {requestData.milestones.map((m, i) => (
                                    <div key={i} className="text-[11px] bg-black/40 p-2 rounded border border-white/5 flex items-center gap-2">
                                        <CheckCircle size={12} className={requestData.senderRequirementsApproved ? "text-green-500" : "text-gray-500"}/> {m.title}
                                    </div>
                                ))}
                            </div>
                        )}
                        {isSender && requestData.milestones?.length > 0 && !requestData.senderRequirementsApproved && (
                            <div className="flex gap-1 mt-4">
                                <button onClick={()=>handleApprove('sender')} className="flex-1 bg-green-600 text-[9px] py-2 rounded font-black uppercase shadow-lg">Approve</button>
                                <button onClick={()=>handleSendBack('sender')} className="flex-1 bg-rose-600 text-[9px] py-2 rounded font-black uppercase shadow-lg">Send Back</button>
                            </div>
                        )}
                    </div>
                )}

                {/* TEACHER RECEIVER TRACK */}
                <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-900/5">
                    <p className="text-[10px] font-black text-emerald-400 mb-1 uppercase tracking-widest text-right">Teacher: {requestData.receiverName}</p>
                    {isSender && (!requestData.receiverRequirements?.length || requestData.receiverReqNeedsUpdate) && (
                        <div className="space-y-2">
                            <input value={newReq} onChange={e=>setNewReq(e.target.value)} placeholder="Propose goal..." className="w-full bg-gray-900 p-2 text-xs rounded border border-gray-700 outline-none"/>
                            <button onClick={addLocalRequirement} className="w-full bg-emerald-600 text-[10px] py-1 rounded font-bold uppercase tracking-widest text-right">Add Goal</button>
                            <button onClick={()=>handleFinalSubmit('receiver')} className="w-full bg-white text-black text-[10px] py-1 rounded font-black uppercase tracking-widest">Submit Plan</button>
                        </div>
                    )}
                    {requestData.receiverRequirements?.length > 0 && (
                        <div className="space-y-1 mt-2">
                            {requestData.receiverRequirements.map((r, i) => (
                                <div key={i} className="text-[11px] bg-black/40 p-2 rounded border border-white/5 flex items-center gap-2 justify-end">
                                    {r} <CheckCircle size={12} className={requestData.receiverRequirementsApproved ? "text-green-500" : "text-gray-500"}/>
                                </div>
                            ))}
                        </div>
                    )}
                    {isReceiver && requestData.receiverRequirements?.length > 0 && !requestData.receiverRequirementsApproved && (
                        <div className="flex gap-1 mt-4">
                            <button onClick={()=>handleApprove('receiver')} className="flex-1 bg-green-600 text-[9px] py-2 rounded font-black uppercase shadow-lg">Approve</button>
                            <button onClick={()=>handleSendBack('receiver')} className="flex-1 bg-rose-600 text-[9px] py-2 rounded font-black uppercase shadow-lg">Send Back</button>
                        </div>
                    )}
                </div>
              </div>
            ) : (
                <div className="text-center py-20 opacity-20"><ThumbsUp size={40} className="mx-auto"/><p className="text-[10px] mt-2 font-black uppercase tracking-widest">{requestData.status}</p></div>
            )}
          </div>
        )}
      </aside>
    </div>
  );
};

export default ChatPage;