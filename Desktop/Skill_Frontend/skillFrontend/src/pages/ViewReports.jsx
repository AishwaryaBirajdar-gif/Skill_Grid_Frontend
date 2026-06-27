import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { Users, Repeat, Award, Download, LogOut } from "lucide-react";

const ViewReports = () => {
    const [users, setUsers] = useState([]);
    const [swaps, setSwaps] = useState([]);
    const [topSkills, setTopSkills] = useState([]);
    const [userNames, setUserNames] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReportData();
    }, []);

    const fetchReportData = async () => {
        try {
            // 1. Fetch Users List
            const userRes = await axiosInstance.get("api/admin/users");
            const fetchedUsers = userRes.data || [];
            setUsers(fetchedUsers);

            // Create id-to-name lookup cache maps
            const nameMap = {};
            fetchedUsers.forEach(u => {
                const id = u.id || u._id;
                if (id) nameMap[id] = u.name;
            });
            setUserNames(nameMap);

            // 2. Fetch Recent Swaps
            const swapRes = await axiosInstance.get("/admin/swaps/recent");
            setSwaps(swapRes.data || []);

            // 3. Clean representation tracking array for Top Skills parsing
            const sampleSkills = [
                { name: "SpringBoot", count: 4 },
                { name: "Java", count: 3 },
                { name: "React", count: 2 }
            ];
            setTopSkills(sampleSkills);

        } catch (error) {
            console.error("Error pulling database report logs:", error);
        } finally {
            setLoading(false);
        }
    };

    const downloadCsvReport = () => {
        window.open("http://localhost:8181/api/admin/reports/download", "_blank");
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            {/* Header Area */}
            <div className="max-w-7xl mx-auto flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">User Activity Report</h1>
                    <p className="text-gray-500 mt-1">Monitor cross-network trades, user metrics, and skill distributions.</p>
                </div>
                <button className="bg-red-500 hover:bg-red-600 text-white font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 transition text-sm">
                    <LogOut size={16} /> Logout
                </button>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left/Middle Column Blocks */}
                <div className="lg:col-span-2 space-y-8">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Skills Pending Card */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                                ⏳ Skills Pending Approval
                            </h3>
                            <p className="text-sm text-gray-400 italic">No pending skill requests waiting for verification.</p>
                        </div>

                        {/* Recent Swap Activity Card Layout */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                                    🔄 Recent Swap Activity
                                </h3>
                                <div className="space-y-3">
                                    {swaps.slice(0, 4).map((swap, idx) => {
                                        const skill = swap.skillRequested || swap.skillOffered || "Skill Swap";
                                        const reqName = userNames[swap.requesterId] || swap.requesterName || "User";
                                        const provName = userNames[swap.providerId] || swap.providerName || "Partner";

                                        return (
                                            <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                                                <p className="font-bold text-gray-800 flex items-center gap-1">
                                                    Barter: <span className="text-indigo-600 font-semibold">{skill}</span>
                                                </p>
                                                <p className="text-gray-500 mt-0.5">
                                                    Swapped: <span className="font-medium text-gray-700">{reqName}</span> ↔ <span className="font-medium text-gray-700">{provName}</span>
                                                </p>
                                            </div>
                                        );
                                    })}
                                    {swaps.length === 0 && (
                                        <p className="text-sm text-gray-400 italic">No transaction history detected.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main User Activity Table Card */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <Users size={20} className="text-indigo-600" /> User Activity
                            </h3>
                            <button 
                                onClick={downloadCsvReport}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-2 shadow-sm transition"
                            >
                                <Download size={16} /> Download CSV
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                                        <th className="py-3 px-4">User</th>
                                        <th className="py-3 px-2 text-center">Offered</th>
                                        <th className="py-3 px-2 text-center">Wanted</th>
                                        <th className="py-3 px-2 text-center">Swaps</th>
                                        <th className="py-3 px-2 text-center">Rating</th>
                                        <th className="py-3 px-4 text-center">Joined</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {users.map((user, idx) => {
                                        const skillsOfferedCount = user.skillsOffered ? (user.skillsOffered.length || 0) : 0;
                                        const skillsWantedCount = user.skillsWanted ? (user.skillsWanted.length || 0) : 0;
                                        
                                        // Read the precise values calculated and compiled directly by our new live API endpoint
                                        const totalSwapsCount = user.totalSwaps || 0;
                                        const joinedDate = user.joinedAt || "N/A";

                                        // Conditional rendering metrics maps labels perfectly
                                        let ratingValue = "No Swaps";
                                        if (user.averageRating > 0) {
                                            ratingValue = `${user.averageRating.toFixed(1)} ★`;
                                        }

                                        return (
                                            <tr key={user.id || idx} className="hover:bg-gray-50/70 transition">
                                                <td className="py-4 px-4">
                                                    <p className="font-bold text-gray-800">{user.name || "Anonymous"}</p>
                                                    <p className="text-xs text-gray-400 font-medium block mt-0.5">
                                                        {user.email || "no-email@exchange.com"}
                                                    </p>
                                                </td>
                                                <td className="py-4 px-2 text-center">
                                                    <span className="bg-blue-50 text-blue-600 font-bold px-2.5 py-1 rounded-lg text-xs border border-blue-100">{skillsOfferedCount}</span>
                                                </td>
                                                <td className="py-4 px-2 text-center">
                                                    <span className="bg-emerald-50 text-emerald-600 font-bold px-2.5 py-1 rounded-lg text-xs border border-emerald-100">{skillsWantedCount}</span>
                                                </td>
                                                <td className="py-4 px-2 text-center font-bold text-gray-700">{totalSwapsCount}</td>
                                                <td className={`py-4 px-2 text-center font-bold text-xs ${ratingValue === "No Swaps" ? "text-gray-400 italic" : "text-amber-500"}`}>
                                                    {ratingValue}
                                                </td>
                                                <td className="py-4 px-4 text-center text-xs text-gray-500 font-medium">{joinedDate}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column Grid Sidebars */}
                <div>
                    {/* Top Skills Dashboard Card */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-6">
                            <Award size={20} className="text-amber-500" /> Top Skills
                        </h3>
                        <div className="space-y-4">
                            {topSkills.map((skill, idx) => {
                                const readableSkillName = typeof skill === "object" ? (skill.name || skill.skillName) : skill;
                                const frequencyCount = skill.count || 4;

                                return (
                                    <div key={idx} className="space-y-1.5">
                                        <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                                            <span>{readableSkillName}</span>
                                            <span className="bg-gray-100 px-2 py-0.5 rounded-md text-gray-500">{frequencyCount}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                            <div 
                                                className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                                                style={{ width: `${Math.min((frequencyCount / 5) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewReports;