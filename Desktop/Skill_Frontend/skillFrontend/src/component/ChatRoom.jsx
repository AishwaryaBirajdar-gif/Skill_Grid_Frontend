import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, ArrowLeft, ShieldCheck } from 'lucide-react';

const ChatRoom = () => {
    const { requestId } = useParams(); // This gets the ID from the URL
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
            <div className="max-w-md w-full text-center space-y-8">
                
                {/* Visual Icon */}
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 animate-pulse"></div>
                    <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 relative">
                        <MessageSquare size={48} className="text-indigo-400" />
                    </div>
                </div>

                {/* Text Content */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-black tracking-tight">Skill Room</h1>
                    <p className="text-slate-400 font-medium">Connecting you for your skill exchange...</p>
                </div>

                {/* ID Display Box */}
                <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-2xl">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Secure Room ID</p>
                    <code className="text-indigo-300 text-sm">{requestId}</code>
                </div>

                <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm font-bold">
                    <ShieldCheck size={16} />
                    <span>Encrypted Connection Ready</span>
                </div>

                {/* Back Button */}
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mx-auto pt-4"
                >
                    <ArrowLeft size={18} />
                    <span>Go Back</span>
                </button>
            </div>
        </div>
    );
};

export default ChatRoom;