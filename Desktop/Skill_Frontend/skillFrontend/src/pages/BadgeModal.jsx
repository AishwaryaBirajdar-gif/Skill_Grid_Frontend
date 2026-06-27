import React from 'react';
import { X, Trophy, Share2, Linkedin, Download, CheckCircle, Award } from 'lucide-react';
import toast from 'react-hot-toast';

const BadgeModal = ({ isOpen, onClose, badgeData }) => {
    if (!isOpen || !badgeData) return null;

    const shareToLinkedIn = () => {
        const text = `I'm excited to share that I've earned a Verified Peer Credential in ${badgeData.skillName} on SkillGrid! 🚀 My proficiency was rated ${badgeData.finalRating}/5 by my barter partner. #SkillGrid #PeerLearning #ProfessionalDevelopment`;
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=https://skillgrid.com/verify/${badgeData.uniqueSerial}`;
        window.open(url, '_blank');
    };

    const copyResumeLine = () => {
        const line = `Verified Proficiency in ${badgeData.skillName} | SkillGrid Peer-to-Peer Network | Credential ID: ${badgeData.uniqueSerial} | Rating: ${badgeData.finalRating}/5`;
        navigator.clipboard.writeText(line);
        toast.success("Resume line copied to clipboard!");
    };

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <div className="relative bg-gray-900 border border-amber-500/30 w-full max-w-lg rounded-[3rem] overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.15)] animate-in zoom-in duration-300">
                
                {/* Decorative Background */}
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-amber-500/10 blur-[100px] rounded-full"></div>
                
                {/* Close Button */}
                <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
                    <X size={24} />
                </button>

                <div className="p-10 flex flex-col items-center text-center">
                    {/* Badge Icon */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-amber-500 blur-2xl opacity-20 animate-pulse"></div>
                        <div className="bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-600 p-6 rounded-full shadow-2xl relative">
                            <Award size={48} className="text-white" />
                        </div>
                    </div>

                    {/* Content */}
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-amber-500 mb-2">Verified Credential</h2>
                    <h1 className="text-3xl font-black text-white tracking-tighter mb-4">
                        {badgeData.skillName}
                    </h1>
                    
                    <div className="bg-gray-800/50 border border-gray-700 px-6 py-4 rounded-2xl mb-8 w-full">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Proficiency Rating</span>
                            <div className="flex items-center gap-1 text-yellow-500">
                                <span className="font-bold">{badgeData.finalRating}</span>
                                <Trophy size={14} />
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Credential ID</span>
                            <span className="text-[10px] font-mono text-gray-300">{badgeData.uniqueSerial}</span>
                        </div>
                    </div>

                    <p className="text-gray-400 text-sm leading-relaxed mb-10 px-4">
                        "Successfully demonstrated expertise and mentored a peer partner, 
                        completing all technical milestones with high-quality feedback."
                    </p>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-4 w-full">
                        <button 
                            onClick={shareToLinkedIn}
                            className="flex items-center justify-center gap-2 bg-[#0077b5] text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all"
                        >
                            <Linkedin size={16} /> Share on LinkedIn
                        </button>
                        <button 
                            onClick={copyResumeLine}
                            className="flex items-center justify-center gap-2 bg-white text-black py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all"
                        >
                            <Download size={16} /> Copy for Resume
                        </button>
                    </div>
                    
                    <p className="mt-8 text-[9px] font-bold text-gray-600 uppercase tracking-widest flex items-center gap-2">
                        <CheckCircle size={10} /> Officially issued by SkillGrid Protocol
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BadgeModal;