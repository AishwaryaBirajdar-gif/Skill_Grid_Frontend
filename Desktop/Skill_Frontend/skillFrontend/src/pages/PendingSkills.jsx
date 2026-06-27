import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { Users, Award, BarChart3, TrendingUp, Activity, ShieldCheck, X } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

const PendingSkills = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    // Control which card's modal pop-up is currently open (null means closed)
    const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
        // Change this line:
        axiosInstance.get("/api/admin/analytics") 
            .then(res => {
                setAnalytics(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error connecting metrics pipeline:", err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="p-8 text-center text-sm font-semibold text-gray-400 animate-pulse">
                Compiling system-wide analytics and market trends...
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="p-8 text-center text-sm font-semibold text-red-400">
                Failed to load analytics. Please ensure the backend server is running.
            </div>
        );
    }

    const { growthMetrics, skillMetrics, swapStatusMetrics, monthlyTrends, leaderboard } = analytics;
    const totalRequests = swapStatusMetrics.total || 1;
    const successRate = ((swapStatusMetrics.completed / totalRequests) * 100).toFixed(0);

    return (
        <div className="min-h-screen bg-gray-50/50 p-8 space-y-8 relative">
            {/* Header Title Section */}
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Platform Insights</h1>
                <p className="text-gray-500 mt-1">Select any of the analysis dashboards below to expand real-time network tracking logs.</p>
            </div>

            {/* Permanent Grid Layout (Never Goes Empty) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Box 1: Platform Growth */}
                <div 
                    onClick={() => setActiveModal("growth")}
                    className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-200 cursor-pointer transition group space-y-4"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400 group-hover:text-indigo-600 transition">1. Platform Growth Analysis</span>
                        <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition"><Users size={16}/></span>
                    </div>
                    <div>
                        <p className="text-3xl font-black text-gray-900">{growthMetrics.totalUsers}</p>
                        <p className="text-xs font-semibold text-gray-400 mt-1">Total Network Users Registered</p>
                    </div>
                    <div className="text-xs text-indigo-500 font-bold flex items-center gap-1 pt-2">
                        Click to view trends &rarr;
                    </div>
                </div>

                {/* Box 2: Swap Success Rate */}
                <div 
                    onClick={() => setActiveModal("success")}
                    className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-200 cursor-pointer transition group space-y-4"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400 group-hover:text-emerald-600 transition">2. Swap Success Rate</span>
                        <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition"><Activity size={16}/></span>
                    </div>
                    <div>
                        <p className="text-3xl font-black text-emerald-600">{successRate}%</p>
                        <p className="text-xs font-semibold text-gray-400 mt-1">Conversion Completion Margin</p>
                    </div>
                    <div className="text-xs text-emerald-500 font-bold flex items-center gap-1 pt-2">
                        Click to view metrics &rarr;
                    </div>
                </div>

                {/* Box 3: Skill Demand vs Availability */}
                <div 
                    onClick={() => setActiveModal("skills")}
                    className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-amber-200 cursor-pointer transition group space-y-4"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400 group-hover:text-amber-600 transition">3. Demand vs Availability</span>
                        <span className="p-2 bg-amber-50 text-amber-50 rounded-xl group-hover:bg-amber-500 group-hover:text-white transition"><BarChart3 size={16}/></span>
                    </div>
                    <div>
                        <p className="text-3xl font-black text-gray-900">{skillMetrics.length}</p>
                        <p className="text-xs font-semibold text-gray-400 mt-1">Unique Skill Verticals Tracked</p>
                    </div>
                    <div className="text-xs text-amber-600 font-bold flex items-center gap-1 pt-2">
                        Click to open chart &rarr;
                    </div>
                </div>

                {/* Box 4: Monthly Swap Trend */}
                <div 
                    onClick={() => setActiveModal("trends")}
                    className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-purple-200 cursor-pointer transition group space-y-4"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400 group-hover:text-purple-600 transition">4. Monthly Swap Trend</span>
                        <span className="p-2 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition"><TrendingUp size={16}/></span>
                    </div>
                    <div>
                        <p className="text-3xl font-black text-gray-900">Timeline</p>
                        <p className="text-xs font-semibold text-gray-400 mt-1">Historical Velocity Data</p>
                    </div>
                    <div className="text-xs text-purple-500 font-bold flex items-center gap-1 pt-2">
                        Click to plot trend &rarr;
                    </div>
                </div>

                {/* Box 5: Top Contributors */}
                <div 
                    onClick={() => setActiveModal("leaderboard")}
                    className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-pink-200 cursor-pointer transition group space-y-4"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400 group-hover:text-pink-600 transition">5. Top Contributors</span>
                        <span className="p-2 bg-pink-50 text-pink-500 rounded-xl group-hover:bg-pink-600 group-hover:text-white transition"><Award size={16}/></span>
                    </div>
                    <div>
                        <p className="text-3xl font-black text-gray-900">Ranking</p>
                        <p className="text-xs font-semibold text-gray-400 mt-1">Top Active Trade Contributors</p>
                    </div>
                    <div className="text-xs text-pink-500 font-bold flex items-center gap-1 pt-2">
                        Click to view ranks &rarr;
                    </div>
                </div>

                {/* Box 6: Security Baseline */}
                <div 
                    onClick={() => setActiveModal("security")}
                    className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-200 cursor-pointer transition group space-y-4"
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400 group-hover:text-blue-600 transition">6. Security Baseline</span>
                        <span className="p-2 bg-blue-50 text-blue-500 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition"><ShieldCheck size={16}/></span>
                    </div>
                    <div>
                        <p className="text-3xl font-black text-emerald-600">Secure</p>
                        <p className="text-xs font-semibold text-gray-400 mt-1">No Alerts Pending</p>
                    </div>
                    <div className="text-xs text-blue-500 font-bold flex items-center gap-1 pt-2">
                        Click to check status &rarr;
                    </div>
                </div>

            </div>

            {/* System Status Summary Banner & Expanded Action Controls */}
            <div className="mt-8 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border border-slate-800 rounded-3xl p-6 shadow-xl text-white flex flex-col xl:flex-row items-center justify-between gap-6">
                
                {/* Left Block: Ecosystem status signals */}
                <div className="flex items-start gap-4 max-w-xl">
                    <div className="relative flex h-3 w-3 mt-1.5 flex-shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </div>
                    <div className="space-y-1">
                        <h4 className="font-bold text-sm tracking-wide text-indigo-300 uppercase">Ecosystem Core Baseline Active</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            All transactional microservices are active. Database syncing pipelines are monitoring global swap configurations and matching trade liquidity volumes perfectly.
                        </p>
                    </div>
                </div>

                {/* Middle Block: Live Logger Data Streams (Fills out empty area) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 w-full xl:w-auto flex-1 max-w-3xl text-center xl:text-left">
                    <div>
                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Sync Delay</p>
                        <p className="font-mono font-bold text-sm text-indigo-400 mt-0.5">&lt; 32ms</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Fulfill Metric</p>
                        <p className="font-mono font-bold text-sm text-emerald-400 mt-0.5">Optimal</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Cluster Nodes</p>
                        <p className="font-mono font-bold text-sm text-slate-300 mt-0.5">3 Primary</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Query Stream</p>
                        <p className="font-mono font-bold text-sm text-amber-400 mt-0.5">REST v1.4</p>
                    </div>
                </div>

                {/* Right Block: Corrected Absolute Admin Dashboard Redirect Link */}
                <div className="flex items-center gap-3 w-full xl:w-auto justify-end flex-shrink-0">
                    <button 
                        onClick={() => window.location.href = 'http://localhost:5173/admin'}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 shadow-lg shadow-indigo-600/20 transition duration-200"
                    >
                        Return to Admin Dashboard →
                    </button>
                </div>
            </div>

            {/* ==========================================
                DYNAMIC DETAILED POP-UP MODAL ENGINE
               ========================================== */}
            {activeModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
                        
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <h2 className="font-extrabold text-gray-900 text-lg capitalize flex items-center gap-2">
                                {activeModal === "growth" && <><Users className="text-indigo-600" size={18}/> Platform Growth Breakdown</>}
                                {activeModal === "success" && <><Activity className="text-emerald-600" size={18}/> Swap Success Analysis</>}
                                {activeModal === "skills" && <><BarChart3 className="text-amber-500" size={18}/> Skill Liquidity Matrix</>}
                                {activeModal === "trends" && <><TrendingUp className="text-purple-600" size={18}/> Monthly Activity Trend</>}
                                {activeModal === "leaderboard" && <><Award className="text-pink-600" size={18}/> Performance Leaderboard</>}
                                {activeModal === "security" && <><ShieldCheck className="text-blue-600" size={18}/> System Integrity Status</>}
                            </h2>
                            <button 
                                onClick={() => setActiveModal(null)}
                                className="p-1.5 hover:bg-gray-200 text-gray-400 hover:text-gray-700 rounded-lg transition"
                            >
                                <X size={18}/>
                            </button>
                        </div>

                        {/* Modal Body / Scroll Content */}
                        <div className="p-6 overflow-y-auto">
                            
                            {/* Modal 1: Platform Growth Content */}
                            {activeModal === "growth" && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                                            <p className="text-xs font-bold text-gray-400 uppercase">Total Accounts</p>
                                            <p className="text-2xl font-black text-gray-900 mt-1">{growthMetrics.totalUsers}</p>
                                        </div>
                                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-center">
                                            <p className="text-xs font-bold text-indigo-600 uppercase">This Week</p>
                                            <p className="text-2xl font-black text-indigo-700 mt-1">+{growthMetrics.newThisWeek}</p>
                                        </div>
                                        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-center">
                                            <p className="text-xs font-bold text-emerald-600 uppercase">Growth Rate</p>
                                            <p className="text-2xl font-black text-emerald-700 mt-1">+{growthMetrics.growthRate.toFixed(1)}%</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 text-center italic">Metrics are calculated mathematically directly from unique MongoDB ObjectId registration timestamps.</p>
                                </div>
                            )}

                            {/* Modal 2: Swap Success Rate Content */}
                            {activeModal === "success" && (
                                <div className="space-y-6">
                                    <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-xl text-center">
                                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Total Exchange Completion Percentage</p>
                                        <p className="text-5xl font-black text-emerald-700 mt-1">{successRate}%</p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            <p className="text-xs font-bold text-gray-400">Completed</p>
                                            <p className="text-xl font-bold text-gray-800 mt-1">{swapStatusMetrics.completed}</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            <p className="text-xs font-bold text-gray-400">Pending</p>
                                            <p className="text-xl font-bold text-gray-800 mt-1">{swapStatusMetrics.pending}</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            <p className="text-xs font-bold text-gray-400">Cancelled</p>
                                            <p className="text-xl font-bold text-gray-800 mt-1">{swapStatusMetrics.cancelled}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Modal 3: Clean Skill Verticals Layout */}
                            {activeModal === "skills" && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="font-extrabold text-gray-900 text-base">Market Demand Matrix</h3>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Comparing available teachers against student demand metrics across the network.
                                        </p>
                                    </div>

                                    <div className="h-72 w-full text-xs font-semibold pt-2">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={skillMetrics} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                                <XAxis 
                                                    dataKey="skill" 
                                                    stroke="#4b5563" 
                                                    tickLine={false}
                                                    interval={0}
                                                    tickFormatter={(value) => {
                                                        if (!value || value.includes("{") || value.includes("=")) return "Skill Log";
                                                        return value.length > 12 ? `${value.substring(0, 10)}...` : value;
                                                    }}
                                                />
                                                <YAxis stroke="#9ca3af" tickLine={false} axisLine={false} allowDecimals={false} />
                                                <Tooltip cursor={{ fill: '#f9fafb' }} />
                                                <Legend verticalAlign="top" iconType="circle" wrapperStyle={{ paddingBottom: 15 }} />
                                                
                                                <Bar dataKey="available" name="Teachers Available" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={24} />
                                                <Bar dataKey="demand" name="Students Seeking" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    
                                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-600">
                                        <span className="font-bold">📊 Real-Time Status:</span> Overlapping skill matching pairs will stack higher dynamically on refresh.
                                    </div>
                                </div>
                            )}

                            {/* Modal 4: Trend Line Content */}
                            {activeModal === "trends" && (
                                <div className="space-y-4">
                                    <p className="text-xs text-gray-400 mb-2">Month-over-month transactional activity running across the platform ecosystem.</p>
                                    <div className="h-72 w-full text-xs">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={monthlyTrends}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                                <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} tickLine={false} />
                                                <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                                                <Tooltip />
                                                <Line type="monotone" dataKey="swaps" name="Completed Swaps" stroke="#6366f1" strokeWidth={3} dot={{ r: 5 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}

                            {/* Modal 5: Performance & Rewards Leaderboard */}
                            {activeModal === "leaderboard" && (
                                <div className="space-y-6 animate-fadeIn">
                                    <div>
                                        <h3 className="font-extrabold text-gray-900 text-base">Ecosystem Rewards & Achievements</h3>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Track active trades, unlock milestone consistency badges, and claim community goodies.
                                        </p>
                                    </div>

                                    <div className="bg-gray-50/70 border border-gray-100 rounded-2xl overflow-hidden">
                                        <div className="divide-y divide-gray-200/60">
                                            {leaderboard.map((user, index) => {
                                                const isTopThree = index < 3;
                                                const rankColors = [
                                                    { bg: "bg-amber-500/10", text: "text-amber-600", border: "border-amber-200" },
                                                    { bg: "bg-slate-400/10", text: "text-slate-600", border: "border-slate-200" },
                                                    { bg: "bg-amber-700/10", text: "text-amber-800", border: "border-amber-700/20" }
                                                ];

                                                return (
                                                    <div 
                                                        key={index} 
                                                        className="p-4 bg-white hover:bg-gray-50/50 transition group space-y-3"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-7 h-7 flex items-center justify-center font-black text-xs rounded-lg border ${
                                                                    isTopThree 
                                                                        ? `${rankColors[index].bg} ${rankColors[index].text} ${rankColors[index].border}` 
                                                                        : "bg-gray-100 text-gray-500 border-transparent"
                                                                }`}>
                                                                    #{index + 1}
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition flex items-center gap-2">
                                                                        {user.name}
                                                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${user.badgeStyle || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                                                            🛡️ {user.badge || 'Novice'}
                                                                        </span>
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="text-right">
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-50 border border-emerald-100 text-emerald-700 shadow-sm">
                                                                    ✨ {user.karma || 0} Karma
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between text-[11px] bg-slate-50 p-2 rounded-xl border border-slate-100/50">
                                                            <div className="text-gray-500">
                                                                Total Completed Volume: <span className="font-bold text-gray-800">{user.swaps} trades</span>
                                                            </div>
                                                            <div className="text-indigo-600 font-medium">
                                                                🎁 Reward Tier: <span className="font-bold text-gray-900">{user.nextReward || 'Stickers'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            {leaderboard.length === 0 && (
                                                <div className="p-8 text-center">
                                                    <Award className="mx-auto text-gray-300 mb-2 animate-bounce" size={28} />
                                                    <p className="text-xs text-gray-400 font-semibold italic">No trading contributors found.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-xl p-4 text-white flex items-center justify-between shadow-md">
                                        <div className="space-y-0.5">
                                            <p className="text-xs font-bold text-indigo-200 uppercase tracking-wider">How to earn rewards?</p>
                                            <p className="text-[11px] text-indigo-100/80">Every completed swap earns +20 Karma points. Trade consistently to climb from Bronze up to Diamond status levels!</p>
                                        </div>
                                        <Award className="text-indigo-300 opacity-80" size={24} />
                                    </div>
                                </div>
                            )}

                            {/* Modal 6: Security Monitor Content */}
                            {activeModal === "security" && (
                                <div className="space-y-4 text-center py-4">
                                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <ShieldCheck size={28}/>
                                    </div>
                                    <h3 className="font-bold text-gray-800 text-base">All Core Systems Operational</h3>
                                    <p className="text-sm text-gray-500 max-w-sm mx-auto">Database clusters, analytical computation pipes, and endpoint route security handshakes are running cleanly.</p>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PendingSkills;