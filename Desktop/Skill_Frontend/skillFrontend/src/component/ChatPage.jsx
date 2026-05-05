import React, { useEffect, useRef, useState } from "react";
import { MdSend } from "react-icons/md";
import { ClipboardList, CheckCircle, Loader2, Star, X, ThumbsUp, AlertCircle } from "lucide-react";
import useChatContext from "../context/ChatContext";
import { useNavigate, useParams } from "react-router-dom";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import toast from "react-hot-toast";
import { baseURL } from "../config/AxiosHelper";
import axiosInstance from "../api/axiosInstance";
import { getMessagess } from "../services/RoomService";
import { timeAgo } from "../config/helper";

const ChatPage = () => {
  const { requestId } = useParams();
  const { currentUser } = useChatContext();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [requestData, setRequestData] = useState(null);
  const [newReq, setNewReq] = useState("");
  const chatBoxRef = useRef(null);
  const stompClientRef = useRef(null);
  const currentUserId = localStorage.getItem("userId") || localStorage.getItem("skillgrid_userId");

  const fetchRoom = async () => {
    try {
      const res = await axiosInstance.get(`/requests/sent/${currentUserId}`);
      const data = res.data.find(r => r.id === requestId) || (await axiosInstance.get(`/requests/my-requests/${currentUserId}`)).data.find(r => r.id === requestId);
      if (data) setRequestData(data);
    } catch (e) {}
  };

  useEffect(() => {
    if (requestId) fetchRoom();
    const socket = new SockJS(`${baseURL}/chat`);
    const client = Stomp.over(socket);
    client.connect({}, () => {
      stompClientRef.current = client;
      client.subscribe(`/topic/room/${requestId}`, (m) => {
        setMessages(prev => [...prev, JSON.parse(m.body)]);
        fetchRoom();
      });
    });
    return () => client.disconnect();
  }, [requestId]);

  const handlePropose = async (type) => {
    if (!newReq.trim()) return;
    const currentList = type === 'sender' ? requestData.senderRequirements : requestData.receiverRequirements;
    const payload = type === 'sender' ? { senderRequirements: [...currentList, newReq] } : { receiverRequirements: [...currentList, newReq] };
    const res = await axiosInstance.put(`/requests/${requestId}/propose-requirements`, payload);
    setRequestData(res.data);
    setNewReq("");
    toast.success("Goal Proposed!");
  };

  const handleApprove = async () => {
    const res = await axiosInstance.put(`/requests/${requestId}/approve-track?userId=${currentUserId}`);
    setRequestData(res.data);
    toast.success("Track Approved!");
  };

  const isSender = currentUserId === requestData?.senderId;

  return (
    <div className="flex h-screen bg-slate-950 text-white">
      <div className="flex-1 flex flex-col border-r border-gray-800">
        <header className="p-4 border-b border-gray-800 flex justify-between">
          <h1 className="font-bold text-purple-400">Skill Room</h1>
          <button onClick={() => navigate("/my-requests")} className="text-xs text-red-500">Leave</button>
        </header>
        <main ref={chatBoxRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.sender === currentUser ? "justify-end" : "justify-start"}`}>
              <div className={`p-3 rounded-xl ${m.sender === currentUser ? "bg-purple-600" : "bg-gray-800"}`}>{m.content}</div>
            </div>
          ))}
        </main>
        <footer className="p-4 border-t border-gray-800 flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)} className="flex-1 bg-gray-900 p-2 rounded" placeholder="Message..." />
          <button onClick={() => { stompClientRef.current.send(`/app/sendMessage/${requestId}`, {}, JSON.stringify({sender: currentUser, content: input, roomId: requestId})); setInput(""); }} className="bg-purple-600 p-2 rounded"><MdSend/></button>
        </footer>
      </div>

      <aside className="w-96 p-6 bg-gray-900/20 overflow-y-auto">
        <h2 className="flex gap-2 font-bold mb-6"><ClipboardList className="text-purple-400"/> Negotiation</h2>
        
        {requestData?.status === "ACCEPTED" ? (
          <div className="space-y-6">
            {/* Track 1: Teacher = Sender (Sanika) */}
            <div className={`p-4 rounded-xl border ${requestData.senderRequirementsApproved ? 'border-green-500 bg-green-500/5' : 'border-purple-500/20 bg-purple-900/5'}`}>
                <p className="text-[10px] font-bold text-purple-400 mb-2 uppercase">Teach: {requestData.skillOffered} (Teacher: {requestData.senderName})</p>
                {!isSender && !requestData.senderRequirementsApproved && (
                    <div className="flex gap-1 mb-2">
                        <input value={newReq} onChange={e=>setNewReq(e.target.value)} placeholder="I want to learn..." className="flex-1 bg-gray-800 p-1 text-[10px] rounded outline-none"/>
                        <button onClick={()=>handlePropose('sender')} className="bg-purple-600 px-2 rounded">+</button>
                    </div>
                )}
                <div className="space-y-1 mb-3">
                    {requestData.senderRequirements.map((r, i) => <div key={i} className="text-[11px] text-gray-300">- {r}</div>)}
                </div>
                {isSender && !requestData.senderRequirementsApproved && requestData.senderRequirements.length > 0 && (
                    <button onClick={handleApprove} className="w-full bg-green-600 py-1 rounded text-[10px] font-bold">Approve List</button>
                )}
            </div>

            {/* Track 2: Teacher = Receiver (Chutki) */}
            <div className={`p-4 rounded-xl border ${requestData.receiverRequirementsApproved ? 'border-green-500 bg-green-500/5' : 'border-emerald-500/20 bg-emerald-900/5'}`}>
                <p className="text-[10px] font-bold text-emerald-400 mb-2 uppercase">Teach: {requestData.skillRequested} (Teacher: {requestData.receiverName})</p>
                {isSender && !requestData.receiverRequirementsApproved && (
                    <div className="flex gap-1 mb-2">
                        <input value={newReq} onChange={e=>setNewReq(e.target.value)} placeholder="I want to learn..." className="flex-1 bg-gray-800 p-1 text-[10px] rounded outline-none"/>
                        <button onClick={()=>handlePropose('receiver')} className="bg-emerald-600 px-2 rounded">+</button>
                    </div>
                )}
                <div className="space-y-1 mb-3">
                    {requestData.receiverRequirements.map((r, i) => <div key={i} className="text-[11px] text-gray-300">- {r}</div>)}
                </div>
                {!isSender && !requestData.receiverRequirementsApproved && requestData.receiverRequirements.length > 0 && (
                    <button onClick={handleApprove} className="w-full bg-green-600 py-1 rounded text-[10px] font-bold">Approve List</button>
                )}
            </div>

            <button onClick={() => axiosInstance.put(`/requests/${requestId}/reject-barter`)} className="w-full border border-red-500 text-red-500 py-2 rounded text-xs">Reject Barter</button>
          </div>
        ) : requestData?.status === "ACTIVE" ? (
          <div className="space-y-6">
              {/* Execution View (Sender Track) */}
              <div className="p-4 bg-gray-800 rounded-xl border border-gray-700">
                <p className="text-xs font-bold text-purple-400 mb-2">{requestData.skillOffered}</p>
                <div className="h-1 bg-gray-900 mb-3 rounded-full overflow-hidden"><div className="h-full bg-purple-500" style={{width: `${requestData.senderProgress}%`}}></div></div>
                {isSender ? <button disabled={requestData.senderLocked} onClick={()=>axiosInstance.put(`/requests/${requestId}/submit-work?userId=${currentUserId}`)} className="w-full bg-purple-600 text-[10px] py-1 rounded">Submit Lesson</button> 
                          : requestData.senderLocked && <button onClick={()=>axiosInstance.put(`/requests/${requestId}/verify-work?verifierId=${currentUserId}`)} className="w-full bg-emerald-600 text-[10px] py-1 rounded">Verify Lesson</button>}
              </div>
          </div>
        ) : null}
      </aside>
    </div>
  );
};

export default ChatPage;