import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { Repeat } from "lucide-react";

const RecentSwaps = () => {
    const [swaps, setSwaps] = useState([]);
    const [loading, setLoading] = useState(true);
    // Dynamic mapper store for profile IDs
    const [userNames, setUserNames] = useState({});

    useEffect(() => {
        fetchRecentSwapsAndUsers();
    }, []);

    const fetchRecentSwapsAndUsers = async () => {
        try {
            // 1. Fetch live swap request listings
            const swapRes = await axiosInstance.get("api/admin/swaps/recent");
            const swapsData = swapRes.data || [];
            setSwaps(swapsData);

            // Create a temporary cache map
            const nameMap = {};

            // 2. Fetch data from your admin users endpoint (baseUser collection maps)
            try {
                const baseUserRes = await axiosInstance.get("/admin/users");
                const baseUsers = baseUserRes.data || [];
                baseUsers.forEach(u => {
                    const id = u.id || u._id;
                    if (id && u.name) nameMap[id] = u.name;
                });
            } catch (err) {
                console.error("BaseUser fetch bypass:", err);
            }

            // 3. FALLBACK SAFETY CHECK: Try pulling from a standard global users endpoint if available
            try {
                const alternativeUserRes = await axiosInstance.get("/users");
                const alternativeUsers = alternativeUserRes.data || [];
                alternativeUsers.forEach(u => {
                    const id = u.id || u._id;
                    if (id && u.name) nameMap[id] = u.name;
                });
            } catch (err) {
                // Safely ignore if /api/users endpoint doesn't exist
            }

            setUserNames(nameMap);

        } catch (error) {
            console.error("Error setting up dynamic tracking grids:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Section Header */}
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Recent Swap Activity</h1>
                    <p className="text-gray-500 mt-1">Full transaction monitoring feed and exchange logs.</p>
                </div>

                {/* Main Dynamic Container */}
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                    {loading ? (
                        <p className="text-gray-500 text-center py-6 animate-pulse">Loading transaction records...</p>
                    ) : swaps.length > 0 ? (
                        <div className="grid gap-4">
                            {swaps.map((swap, idx) => {
                                const barteredSkill = swap.skillRequested || swap.skillOffered || "Skill Exchange";
                                const formattedDate = swap.startDate || swap.createdAt || swap.date || "Recent Entry";
                                const cleanStatus = swap.status ? swap.status.toUpperCase() : "PENDING";

                                // 🔄 FIXED RESOLVER STRATEGY: Try cached names first. 
                                // If missing, display a cleaner shortened raw alphanumeric ID representation instead of "User"
                                const requesterName = userNames[swap.requesterId] || (swap.requesterId ? `ID-${swap.requesterId.substring(0, 6)}` : "Unknown User");
                                const providerName = userNames[swap.providerId] || (swap.providerId ? `ID-${swap.providerId.substring(0, 6)}` : "Unknown User");

                                const statusStyles = 
                                    cleanStatus === "CLOSED" || cleanStatus === "COMPLETED" 
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                        : cleanStatus === "ACCEPTED" || cleanStatus === "ACTIVE"
                                        ? "bg-blue-50 text-blue-700 border-blue-200"
                                        : "bg-amber-50 text-amber-700 border-amber-200";

                                return (
                                    <div key={swap.id || idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-gray-100/60 transition gap-4">
                                        <div className="flex items-start sm:items-center gap-4">
                                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hidden sm:block">
                                                <Repeat size={20} />
                                            </div>
                                            <div>
                                                <p className="text-base font-bold text-gray-800">
                                                    Barter Swap: <span className="text-indigo-600 font-semibold">{barteredSkill}</span>
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1 flex flex-wrap gap-x-3 gap-y-1">
                                                    <span><strong>From Users:</strong> <span className="text-indigo-600 font-bold">{requesterName}</span> ↔ <span className="text-indigo-600 font-bold">{providerName}</span></span>
                                                    <span>•</span>
                                                    <span><strong>Timeline:</strong> {formattedDate}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center self-end sm:self-center">
                                            <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border tracking-wide ${statusStyles}`}>
                                                {cleanStatus}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-6 italic">No recent swap activity found in the database.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecentSwaps;