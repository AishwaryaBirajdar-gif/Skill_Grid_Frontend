import React, { useEffect, useRef, useState } from "react";
import { MdSend } from "react-icons/md";
// ✅ FIXED: Added CheckCircle, RotateCcw, and AlertCircle to the imports
import { 
  ClipboardList, 
  CheckCircle, 
  Loader2, 
  Send, 
  X, 
  RotateCcw, 
  AlertCircle, 
  Coins, 
  ThumbsUp 
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
  const currentUserId = localStorage.getItem("userId") || localStorage.getItem("skillgrid_userId");

  const fetchRoom = async () => {
    try {
      const res = await axiosInstance.get(`/requests/${requestId}`);
      if (res.data) setRequestData(res.data);
    } catch (e) { console.error("Sync Error", e); }
  };

  // ✅ FIXED: Using socketFactory to eliminate the "Stomp.over did not receive a factory" warning
  useEffect(() => {
    if (requestId) fetchRoom();
    
    const socketFactory = () => new SockJS(`${baseURL}/chat`);
    const client = Stomp.over(socketFactory);
    
    client.connect({}, () => {
      stompClientRef.current = client;
      client.subscribe(`/topic/room/${requestId}`, (m) => {
        setMessages(prev => [...prev, JSON.parse(m.body)]);
        fetchRoom(); 
      });
    });
    
    return () => {
      if (stompClientRef.current) stompClientRef.current.disconnect();
    };
  }, [requestId]);

  const addLocalRequirement = () => {
    if (!newReq.trim()) return;
    setLocalReqs([...localReqs, newReq]);
    setNewReq("");
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
    } catch (e) { toast.error("Submission failed."); }
  };

  const handleSendBack = async (track) => {
    try {
      const res = await axiosInstance.put(`/requests/${requestId}/send-back?trackType=${track}`);
      setRequestData(res.data);
      toast.success("Requested changes from partner!");
    } catch (e) { toast.error("Failed to send back."); }
  };

  const handleApprove = async () => {
    try {
      const res = await axiosInstance.put(`/requests/${requestId}/approve-track?userId=${currentUserId}`);
      setRequestData(res.data);
      toast.success("Track Approved!");
    } catch (e) { toast.error("Approval failed."); }
  };

  const isSender = currentUserId === requestData?.senderId;

  // Auto-scroll chat
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden font-sans">
      <div className="flex-1 flex flex-col border-r border-gray-800">
        <header className="p-4 border-b border-gray-800 flex justify-between">
          <h1 className="font-bold text-purple-400 uppercase tracking-tighter">SkillGrid Room</h1>
          <button onClick={() => navigate("/my-requests")} className="text-xs text-red-500 hover:underline">Leave Room</button>
        </header>
        
        <main ref={chatBoxRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.sender === currentUser ? "justify-end" : "justify-start"}`}>
              <div className={`p-3 max-w-[70%] rounded-xl ${m.sender === currentUser ? "bg-purple-600 shadow-lg" : "bg-gray-800"}`}>
                <p className="text-[10px] font-bold mb-1 opacity-50">{m.sender}</p>
                <p className="text-sm">{m.content}</p>
              </div>
            </div>
          ))}
        </main>

        <footer className="p-4 border-t border-gray-800 flex gap-2">
          <input 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            onKeyPress={(e) => e.key === 'Enter' && input.trim() && stompClientRef.current.send(`/app/sendMessage/${requestId}`, {}, JSON.stringify({sender: currentUser, content: input, roomId: requestId})) && setInput("")} 
            className="flex-1 bg-gray-900 p-2 rounded-lg outline-none" 
            placeholder="Message partner..." 
          />
          <button 
            onClick={() => { if(!input.trim()) return; stompClientRef.current.send(`/app/sendMessage/${requestId}`, {}, JSON.stringify({sender: currentUser, content: input, roomId: requestId})); setInput(""); }} 
            className="bg-purple-600 p-2 rounded-lg hover:bg-purple-500 transition-all"
          >
            <MdSend size={20}/>
          </button>
        </footer>
      </div>

      <aside className="w-96 p-6 bg-gray-900/20 overflow-y-auto">
        <h2 className="flex gap-2 font-bold mb-6 items-center"><ClipboardList className="text-purple-400"/> Negotiation</h2>
        
        {!requestData ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-purple-500" /></div> : (
          <div className="space-y-6">
            {requestData.status === "ACCEPTED" ? (
              <>
                {/* TRACK 1: Sender Teaches Partner */}
                <div className={`p-4 rounded-xl border transition-all ${requestData.senderRequirementsApproved ? 'border-green-500 bg-green-500/5' : 'border-purple-500/20 bg-purple-900/5'}`}>
                    <p className="text-[10px] font-black text-purple-400 mb-1 uppercase tracking-widest">Teacher: {requestData.senderName}</p>
                    <p className="text-sm font-bold mb-4">Teaching: {requestData.skillOffered}</p>
                    
                    {!isSender && (!requestData.milestones?.length || requestData.senderReqNeedsUpdate) && (
                        <div className="space-y-3 p-3 bg-black/40 rounded-lg border border-purple-500/30">
                            <p className="text-[10px] text-amber-400 font-bold flex items-center gap-1 uppercase">
                                <RotateCcw size={10}/> {requestData.senderReqNeedsUpdate ? "Changes Requested" : "Define Your Goals"}
                            </p>
                            <div className="flex gap-1">
                                <input value={newReq} onChange={e=>setNewReq(e.target.value)} placeholder="Add a goal..." className="flex-1 bg-gray-800 p-2 text-xs rounded outline-none"/>
                                <button onClick={addLocalRequirement} className="bg-purple-600 px-3 rounded text-white">+</button>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {localReqs.map((lr, i) => (
                                    <span key={i} className="bg-purple-600 text-[9px] px-2 py-1 rounded flex items-center gap-1 font-bold">
                                        {lr} <X size={10} className="cursor-pointer" onClick={() => setLocalReqs(localReqs.filter((_, idx) => idx !== i))}/>
                                    </span>
                                ))}
                            </div>
                            <button onClick={() => handleFinalSubmit('sender')} className="w-full bg-white text-black py-2 rounded text-[10px] font-black flex items-center justify-center gap-2">
                                <Send size={12}/> SUBMIT GOALS
                            </button>
                        </div>
                    )}
                    
                    {isSender && requestData.milestones?.length > 0 && !requestData.senderRequirementsApproved && (
                        <div className="flex gap-1 mb-4">
                            <button onClick={handleApprove} className="flex-1 bg-green-600 py-2 rounded text-[9px] font-black hover:bg-green-500">APPROVE</button>
                            <button onClick={() => handleSendBack('sender')} className="flex-1 bg-rose-600 py-2 rounded text-[9px] font-black hover:bg-rose-500">SEND BACK</button>
                        </div>
                    )}

                    {requestData.milestones?.length > 0 && !requestData.senderReqNeedsUpdate && (
                        <div className="space-y-1">
                            {requestData.milestones.map((m, i) => (
                                <div key={i} className="text-[11px] text-gray-300 bg-black/40 p-2 rounded border border-white/5 flex items-center gap-2">
                                    <CheckCircle size={12} className={requestData.senderRequirementsApproved ? "text-green-500" : "text-gray-500"}/> Goal: {m.title}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* TRACK 2: Receiver Teaches Sender */}
                <div className={`p-4 rounded-xl border transition-all ${requestData.receiverRequirementsApproved ? 'border-green-500 bg-green-500/5' : 'border-emerald-500/20 bg-emerald-900/5'}`}>
                    <p className="text-[10px] font-black text-emerald-400 mb-1 uppercase tracking-widest text-right">Teacher: {requestData.receiverName}</p>
                    <p className="text-sm font-bold mb-4 text-right">Teaching: {requestData.skillRequested}</p>

                    {isSender && (!requestData.receiverRequirements?.length || requestData.receiverReqNeedsUpdate) && (
                        <div className="space-y-3 p-3 bg-black/40 rounded-lg border border-emerald-500/30">
                            <p className="text-[10px] text-amber-400 font-bold flex items-center gap-1 uppercase">
                                <RotateCcw size={10}/> {requestData.receiverReqNeedsUpdate ? "Changes Requested" : "Define Your Goals"}
                            </p>
                            <div className="flex gap-1">
                                <input value={newReq} onChange={e=>setNewReq(e.target.value)} placeholder="Add a goal..." className="flex-1 bg-gray-800 p-2 text-xs rounded outline-none"/>
                                <button onClick={addLocalRequirement} className="bg-emerald-600 px-3 rounded text-white">+</button>
                            </div>
                            <div className="flex flex-wrap gap-1 justify-end">
                                {localReqs.map((lr, i) => (
                                    <span key={i} className="bg-emerald-600 text-[9px] px-2 py-1 rounded flex items-center gap-1 font-bold">
                                        {lr} <X size={10} className="cursor-pointer" onClick={() => setLocalReqs(localReqs.filter((_, idx) => idx !== i))}/>
                                    </span>
                                ))}
                            </div>
                            <button onClick={() => handleFinalSubmit('receiver')} className="w-full bg-white text-black py-2 rounded text-[10px] font-black flex items-center justify-center gap-2">
                                <Send size={12}/> SUBMIT GOALS
                            </button>
                        </div>
                    )}

                    {!isSender && requestData.receiverRequirements?.length > 0 && !requestData.receiverRequirementsApproved && (
                        <div className="flex gap-1 mb-4">
                            <button onClick={handleApprove} className="flex-1 bg-green-600 py-2 rounded text-[9px] font-black hover:bg-green-500">APPROVE</button>
                            <button onClick={() => handleSendBack('receiver')} className="flex-1 bg-rose-600 py-2 rounded text-[9px] font-black hover:bg-rose-500">SEND BACK</button>
                        </div>
                    )}

                    {requestData.receiverRequirements?.length > 0 && !requestData.receiverReqNeedsUpdate && (
                        <div className="space-y-1">
                            {requestData.receiverRequirements.map((r, i) => (
                                <div key={i} className="text-[11px] text-gray-300 bg-black/40 p-2 rounded border border-white/5 flex items-center gap-2 justify-end">
                                    Goal: {r} <CheckCircle size={12} className={requestData.receiverRequirementsApproved ? "text-green-500" : "text-gray-500"}/>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
              </>
            ) : requestData.status === "ACTIVE" ? (
              <div className="space-y-6">
                  <div className="p-4 bg-gray-900 border border-purple-500/30 rounded-2xl">
                    <p className="text-[10px] font-black text-purple-400 mb-2 uppercase">My Teaching Progress: {requestData.skillOffered}</p>
                    <div className="h-1.5 bg-gray-800 mb-4 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500" style={{width: `${requestData.senderProgress}%`}}></div>
                    </div>
                    {isSender ? (
                        <button disabled={requestData.senderLocked} onClick={()=>axiosInstance.put(`/requests/${requestId}/submit-work?userId=${currentUserId}`)} className="w-full py-2 rounded-lg text-[10px] font-black bg-purple-600 disabled:bg-gray-800">
                            {requestData.senderLocked ? "AWAITING VERIFICATION" : "SUBMIT LESSON"}
                        </button>
                    ) : (
                        requestData.senderLocked && <button onClick={()=>axiosInstance.put(`/requests/${requestId}/verify-work?verifierId=${currentUserId}`)} className="w-full bg-green-600 text-[10px] py-2 rounded-lg font-black tracking-widest">VERIFY PARTNER'S WORK</button>
                    )}
                  </div>

                  <div className="p-4 bg-gray-900 border border-emerald-500/30 rounded-2xl">
                    <p className="text-[10px] font-black text-emerald-400 mb-2 uppercase text-right">Partner Teaching: {requestData.skillRequested}</p>
                    <div className="h-1.5 bg-gray-800 mb-4 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{width: `${requestData.receiverProgress}%`}}></div>
                    </div>
                    {!isSender ? (
                        <button disabled={requestData.receiverLocked} onClick={()=>axiosInstance.put(`/requests/${requestId}/submit-work?userId=${currentUserId}`)} className="w-full py-2 rounded-lg text-[10px] font-black bg-emerald-600 disabled:bg-gray-800">
                            {requestData.receiverLocked ? "AWAITING VERIFICATION" : "SUBMIT LESSON"}
                        </button>
                    ) : (
                        requestData.receiverLocked && <button onClick={()=>axiosInstance.put(`/requests/${requestId}/verify-work?verifierId=${currentUserId}`)} className="w-full bg-green-600 text-[10px] py-2 rounded-lg font-black tracking-widest">VERIFY PARTNER'S WORK</button>
                    )}
                  </div>
              </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                    <ThumbsUp size={40} className="mb-2 opacity-20"/>
                    <p className="text-xs font-bold uppercase tracking-widest">Room Status: {requestData.status}</p>
                </div>
            )}
          </div>
        )}
      </aside>
    </div>
  );
};

export default ChatPage;