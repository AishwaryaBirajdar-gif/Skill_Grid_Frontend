import React, { useEffect, useRef, useState } from "react";
import { MdAttachFile, MdSend } from "react-icons/md";
import useChatContext from "../context/ChatContext";
import { useNavigate, useParams } from "react-router-dom";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import toast from "react-hot-toast";
import { baseURL } from "../config/AxiosHelper";
import { getMessagess } from "../services/RoomService";
import { timeAgo } from "../config/helper";

const ChatPage = () => {
  const { requestId } = useParams();
  const { currentUser, setCurrentUser, setConnected, setRoomId } = useChatContext();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isClientConnected, setIsClientConnected] = useState(false);
  
  const chatBoxRef = useRef(null);
  const stompClientRef = useRef(null);

  // 1. Fixed Validation: Uses the actual keys from your Login logs
  useEffect(() => {
    const savedEmail = localStorage.getItem("email");
    const savedUserId = localStorage.getItem("userId");

    // If no user in state but exists in storage, sync it
    if (!currentUser && savedEmail) {
        setCurrentUser(savedEmail);
    }

    // Redirect ONLY if no user is found anywhere
    if (!currentUser && !savedEmail && !savedUserId) {
        console.log("No user found, redirecting to login...");
        navigate("/login");
        return;
    }

    if (requestId) {
      setRoomId(requestId);
    }
  }, [requestId, currentUser, setCurrentUser, navigate, setRoomId]);

  // 2. Load History and Establish Connection
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const data = await getMessagess(requestId);
        setMessages(data || []);
      } catch (error) {
        console.error("Error loading chat history:", error);
        setMessages([]); 
      }
    };

    const connectWebSocket = () => {
      const socket = new SockJS(`${baseURL}/chat`);
      const client = Stomp.over(() => socket);
      client.debug = () => {}; 

      client.connect({}, () => {
        stompClientRef.current = client;
        setIsClientConnected(true);
        setConnected(true);
        toast.success("Joined Chat Room");

        client.subscribe(`/topic/room/${requestId}`, (message) => {
          const newMessage = JSON.parse(message.body);
          setMessages((prev) => [...prev, newMessage]);
        });
      }, (err) => {
        console.error("WebSocket Connection Error:", err);
        setIsClientConnected(true); 
      });
    };

    if (requestId) {
      loadMessages();
      connectWebSocket();
    }

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.disconnect();
      }
    };
  }, [requestId, setConnected]);

  // 3. Auto-scroll to bottom (Fixed syntax here)
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTo({
        top: chatBoxRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages]);

  const sendMessage = () => {
    if (stompClientRef.current && input.trim()) {
      const messageData = {
        sender: currentUser || localStorage.getItem("email") || "User", 
        content: input.trim(),
        roomId: requestId,
        timeStamp: new Date().toISOString()
      };

      stompClientRef.current.send(
        `/app/sendMessage/${requestId}`, 
        {}, 
        JSON.stringify(messageData)
      );
      setInput("");
    }
  };

  if (!isClientConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500 mb-4"></div>
        <p className="text-gray-400 animate-pulse">Initializing Room...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white">
      <header className="p-4 bg-gray-900/50 backdrop-blur-md border-b border-gray-800 flex justify-between items-center sticky top-0 z-10">
        <div className="flex flex-col">
           <h1 className="font-bold text-purple-400 text-sm md:text-base">Skill Room</h1>
           <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">ID: {requestId?.substring(0, 8)}...</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="hidden md:flex flex-col items-end">
             <span className="text-[10px] text-gray-400 uppercase">Chatting as</span>
             <span className="text-green-400 text-xs font-bold">{currentUser}</span>
           </div>
           <button onClick={() => navigate("/my-requests")} className="text-xs bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/50 px-4 py-1.5 rounded-full">Leave</button>
        </div>
      </header>

      <main ref={chatBoxRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-600 italic text-center">
            <p>Ready to exchange skills!<br/>Type a message below.</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.sender === currentUser ? "justify-end" : "justify-start"}`}>
              <div className={`group flex flex-col max-w-[85%] md:max-w-md ${msg.sender === currentUser ? "items-end" : "items-start"}`}>
                 <span className="text-[10px] font-bold text-gray-500 mb-1 px-1">{msg.sender}</span>
                 <div className={`p-3 md:p-4 rounded-2xl shadow-lg ${msg.sender === currentUser ? "bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-tr-none" : "bg-gray-800 text-gray-100 rounded-tl-none border border-gray-700"}`}>
                    <p className="text-sm md:text-base leading-relaxed break-words">{msg.content}</p>
                    <p className="text-[9px] mt-2 opacity-40 text-right italic">{timeAgo(msg.timeStamp)}</p>
                 </div>
              </div>
            </div>
          ))
        )}
      </main>

      <footer className="p-4 bg-gray-900/80 border-t border-gray-800">
        <div className="max-w-4xl mx-auto flex gap-3 items-center bg-gray-800/50 p-2 rounded-2xl border border-gray-700">
          <button className="p-2 text-gray-400 hover:text-purple-400"><MdAttachFile size={22} /></button>
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} className="flex-1 bg-transparent p-2 outline-none text-sm md:text-base placeholder-gray-500" placeholder="Type your message..." />
          <button onClick={sendMessage} disabled={!input.trim()} className="bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 p-3 rounded-xl shadow-lg text-white"><MdSend size={20} /></button>
        </div>
      </footer>
    </div>
  );
};

export default ChatPage;