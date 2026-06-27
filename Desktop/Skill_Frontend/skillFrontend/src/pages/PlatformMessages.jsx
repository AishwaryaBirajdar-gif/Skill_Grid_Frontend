import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { Trash2, Plus, X, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PlatformMessages = () => {
    const [messages, setMessages] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newMessage, setNewMessage] = useState({ title: "", content: "" });
    const navigate = useNavigate();

    useEffect(() => { fetchMessages(); }, []);

    const fetchMessages = async () => {
        try {
            const res = await axiosInstance.get("api/admin/messages");
            setMessages(res.data);
        } catch (err) { console.error("Error fetching messages", err); }
    };

    const handleSendMessage = async () => {
        await axiosInstance.post("/admin/messages", newMessage);
        setNewMessage({ title: "", content: "" });
        setIsModalOpen(false);
        fetchMessages();
    };

    const deleteMessage = async (id) => {
        await axiosInstance.delete(`/admin/messages/${id}`);
        fetchMessages();
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                {/* Page Header */}
                <h1 className="text-3xl font-bold mb-6">Platform Messages</h1>
                <p className="text-gray-600 mb-8">Manage platform-wide announcements and updates</p>

                {/* Main Card */}
                <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">
                    {/* Header Bar */}
                    <div className="bg-indigo-700 p-6 text-white flex justify-between items-center">
                        <h2 className="text-lg font-semibold">All Messages ({messages.length})</h2>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setIsModalOpen(true)} 
                                className="bg-indigo-500 hover:bg-indigo-400 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition"
                            >
                                <Plus size={18} /> Send New Message
                            </button>
                            <button 
                                onClick={() => navigate('/admin')} 
                                className="bg-indigo-900 hover:bg-indigo-800 px-4 py-2 rounded-lg text-sm font-medium transition"
                            >
                                ← Back to Dashboard
                            </button>
                        </div>
                    </div>

                    {/* Messages List */}
                    <div className="p-6">
                        {messages.map(msg => (
                            <div key={msg.id} className="border-b border-gray-100 py-6 last:border-0 flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-gray-800">{msg.title}</h3>
                                    <p className="text-gray-600 mt-1">{msg.content}</p>
                                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                                        <span>Sent by: {msg.sender}</span>
                                        <span>{msg.timestamp}</span>
                                    </div>
                                </div>
                                <button onClick={() => deleteMessage(msg.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition">
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Send Platform Message</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                        </div>
                        <input 
                            placeholder="Message Title" 
                            className="w-full p-4 border border-gray-200 rounded-xl mb-4 focus:ring-2 focus:ring-indigo-500 outline-none"
                            onChange={(e) => setNewMessage({...newMessage, title: e.target.value})}
                        />
                        <textarea 
                            placeholder="Write your platform-wide message here..." 
                            className="w-full p-4 border border-gray-200 rounded-xl h-32 mb-6 focus:ring-2 focus:ring-indigo-500 outline-none"
                            onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                        />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-gray-600 font-medium">Cancel</button>
                            <button onClick={handleSendMessage} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition">
                                <Send size={18} /> Send Message
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlatformMessages;