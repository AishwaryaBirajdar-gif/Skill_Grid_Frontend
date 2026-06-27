import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 
import axiosInstance from '../api/axiosInstance';
import BadgeModal from './BadgeModal';
import { 
    MessageSquare, PlayCircle, CheckCircle2, 
    ArrowRightLeft, Trophy, Layout, Search,
    Settings2, Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

const LearningRooms = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBadge, setSelectedBadge] = useState(null); 
    const navigate = useNavigate();
    const location = useLocation(); 
    const currentUserId = localStorage.getItem('userId') || localStorage.getItem('skillgrid_userId');

    // ✅ AUTO-OPEN BADGE LOGIC
    // Listens for badge data passed via navigate state from ChatPage
    useEffect(() => {
        if (location.state && location.state.autoOpenBadge) {
            setSelectedBadge(location.state.autoOpenBadge);
            
            // Clean the state so the badge doesn't re-appear on manual refresh
            window.history.replaceState({}, document.title);
        } 
    }, [location.state]); 

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                setLoading(true);
                const [incoming, sent] = await Promise.all([
                    axiosInstance.get(`/requests/my-requests/${currentUserId}`),
                    axiosInstance.get(`/requests/sent/${currentUserId}`)
                ]);
                
                const activeAndFinished = [...incoming.data, ...sent.data].filter(r => 
                    ['ACCEPTED', 'ACTIVE', 'COMPLETED', 'CLOSED'].includes(r.status)
                );
                setRooms(activeAndFinished);
            } catch (err) {
                toast.error("Failed to load your workspaces.");
            } finally {
                setLoading(false);
            }
        };
        if (currentUserId) fetchRooms();
    }, [currentUserId]);

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <Activity className="animate-spin text-purple-500" size={40} />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div>
                        <h1 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-emerald-400">
                            Workspaces
                        </h1>
                        <p className="text-gray-500 mt-2 font-medium uppercase text-[10px] tracking-widest">
                            Active Learning Rooms & Skill Barters
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <button 
                            onClick={() => navigate('/my-requests')} 
                            className="px-6 py-3 bg-gray-900 border border-gray-800 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-purple-500 transition-all text-gray-400 hover:text-white"
                        >
                            Request Inbox
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {rooms.length > 0 ? (
                        rooms.map((room) => (
                            <RoomCard 
                                key={room.id} 
                                room={room} 
                                userId={currentUserId} 
                                navigate={navigate}
                                onShowBadge={(badge) => setSelectedBadge(badge)} 
                            />
                        ))
                    ) : (
                        <div className="col-span-full py-32 text-center border-2 border-dashed border-gray-800 rounded-[3rem] bg-gray-900/20">
                            <Layout className="mx-auto text-gray-700 mb-4" size={48} />
                            <h3 className="text-gray-500 font-bold uppercase tracking-widest text-xs">No active learning rooms yet.</h3>
                            <button onClick={() => navigate('/browse-skill')} className="text-purple-400 text-xs mt-4 font-black uppercase hover:underline">
                                Browse skills to start
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ✅ THE BADGE MODAL OVERLAY */}
            <BadgeModal 
                isOpen={!!selectedBadge} 
                onClose={() => setSelectedBadge(null)} 
                badgeData={selectedBadge} 
            />
        </div>
    );
};

const RoomCard = ({ room, userId, navigate, onShowBadge }) => {
    const isCompleted = room.status === 'COMPLETED' || room.status === 'CLOSED';
    const partnerName = userId === room.senderId ? room.receiverName : room.senderName;

    // ✅ HANDLE MANUAL TROPHY CLICK (FETCH FROM DB)
    const handleTrophyClick = async () => {
        if (!isCompleted) {
            navigate(`/chat/${room.id}`);
            return;
        }

        try {
            // ✅ Calls your Task-to-Job Converter in the backend
            const res = await axiosInstance.post(`/credentials/generate/${room.id}?userId=${userId}`);
            onShowBadge(res.data);
        } catch (err) {
            toast.error("Please ensure feedback is submitted first!");
            navigate(`/chat/${room.id}`);
        }
    };

    return (
        <div className="group relative bg-gray-900/40 border border-gray-800 rounded-[2.5rem] p-8 hover:border-purple-500/50 transition-all duration-500 overflow-hidden shadow-2xl">
            <div className={`absolute -top-24 -right-24 w-48 h-48 blur-[100px] opacity-20 rounded-full transition-colors ${isCompleted ? 'bg-emerald-500' : 'bg-purple-500'}`}></div>

            <div className="relative z-10 h-full flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        isCompleted ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                    }`}>
                        {room.status}
                    </span>
                    <Settings2 size={16} className="text-gray-700 cursor-pointer hover:text-white" />
                </div>

                <h2 className="text-2xl font-black mb-1 line-clamp-1 tracking-tighter">{room.skillRequested}</h2>
                <div className="flex items-center gap-2 text-gray-500 text-[10px] font-black mb-8 uppercase tracking-[0.2em]">
                    <span>{room.skillOffered === 'KARMA_PAYMENT' ? 'Karma Exchange' : `Swap: ${room.skillOffered}`}</span>
                </div>

                <div className="space-y-6 mb-10">
                    <ProgressBar label={`${room.senderName} (Teacher)`} val={room.senderProgress} color="bg-purple-500" />
                    <ProgressBar label={`${room.receiverName} (Learner)`} val={room.receiverProgress} color="bg-emerald-500" />
                </div>

                <div className="mt-auto pt-6 border-t border-gray-800/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center font-black text-purple-400 text-xs">
                            {partnerName?.charAt(0)}
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{partnerName}</p>
                    </div>
                    <button 
                        onClick={handleTrophyClick} 
                        className={`p-4 rounded-2xl transition-all shadow-xl hover:scale-110 active:scale-95 ${
                            isCompleted ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20' : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/20'
                        }`}
                    >
                        {isCompleted ? <Trophy size={20}/> : <MessageSquare size={20} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ProgressBar = ({ label, val, color }) => (
    <div className="space-y-2">
        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-gray-500">
            <span>{label}</span>
            <span className={val === 100 ? "text-emerald-400" : ""}>{val}%</span>
        </div>
        <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
            <div 
                className={`h-full ${color} transition-all duration-1000 ease-out`} 
                style={{ width: `${val}%` }}
            ></div>
        </div>
    </div>
);

export default LearningRooms;