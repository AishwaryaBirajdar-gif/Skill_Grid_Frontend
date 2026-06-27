import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Layers, Users, BookOpen, Clock, CheckCircle, 
  AlertTriangle, Repeat, Zap, User, ChevronDown 
} from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalUsers: 0, totalSkills: 0, pendingSwaps: 0, completedSwaps: 0 });
  
  // ✅ NEW STATE: Added for real-time widget previews
  const [pendingSkills, setPendingSkills] = useState([]);
  const [recentSwaps, setRecentSwaps] = useState([]);

  useEffect(() => {
    // Existing stats fetch
    axios.get('http://localhost:8181/api/admin/dashboard-stats')
      .then(response => setStats(response.data))
      .catch(error => console.error("Error fetching stats:", error));

    // ✅ NEW FETCH: Load pending detailed skills preview data
    axios.get('http://localhost:8181/api/admin/detailed-skills/pending')
      .then(response => setPendingSkills(response.slice(0, 3))) // Preview the top 3 items
      .catch(error => console.error("Error fetching pending skills preview:", error));

    // ✅ NEW FETCH: Load recent platform swaps preview data
    axios.get('http://localhost:8181/api/admin/swaps/recent')
      .then(response => setRecentSwaps(response.data.slice(0, 3))) // Preview the top 3 items
      .catch(error => console.error("Error fetching recent swaps preview:", error));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xl font-bold text-indigo-600">
          <Layers /> SkillGrid
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full font-medium text-gray-700 hover:bg-gray-200 transition">
            <User size={18} /> admin <ChevronDown size={16} />
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 pt-8 space-y-10">
        {/* Dashboard Title */}
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage platform users, skills, and activity logs.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Total Users" value={stats.totalUsers} icon={<Users size={28}/>} color="bg-blue-600" />
          <StatCard label="Total Skills" value={stats.totalSkills} icon={<BookOpen size={28}/>} color="bg-emerald-600" />
          <StatCard label="Pending Swaps" value={stats.pendingSwaps} icon={<Clock size={28}/>} color="bg-amber-500" />
          <StatCard label="Completed Swaps" value={stats.completedSwaps} icon={<CheckCircle size={28}/>} color="bg-cyan-500" />
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Zap size={22} className="text-indigo-600" /> Quick Actions
          </h2>
          <div className="flex flex-wrap gap-4">
            <ActionButton label="Manage Users" onClick={() => navigate('/admin/users')} />
            <ActionButton label="Platform Messages" onClick={() => navigate('/admin/messages')} />
            <ActionButton label="View Reports" onClick={() => navigate('/admin/reports')} />
            <ActionButton label="Send Platform Message" onClick={() => navigate('/admin/messages')} />
          </div>
        </div>

        {/* Bottom Sections: Enhanced with direct data rows */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Skills Pending Approval */}
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="p-4 bg-orange-50 text-orange-500 w-max rounded-2xl mb-6">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Platform Insights </h3>
              <p className="text-gray-500 mb-4">Review new insigths from users.</p>
              
              {/* ✅ LIVE PREVIEW ITEMS */}
              <div className="space-y-3 mb-6">
                {pendingSkills.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No skills waiting for verification.</p>
                ) : (
                  pendingSkills.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div>
                        <p className="text-sm font-bold text-gray-800">{item.userName}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[200px]">{item.description || "No skill summary details."}</p>
                      </div>
                      <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2.5 py-1 rounded-md">
                        {item.skillName}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
            <button 
              onClick={() => navigate('/admin/pending-skills')} 
              className="text-indigo-600 font-bold text-sm flex items-center gap-1 hover:text-indigo-800 mt-2"
            >
              VIEW DETAILS →
            </button>
          </div>

          {/* Recent Swap Activity - Polished & Dynamic Layout */}
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="p-4 bg-blue-50 text-blue-500 w-max rounded-2xl mb-6">
                <Repeat size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Recent Swap Activity</h3>
              <p className="text-gray-500 mb-4">View the latest platform transactions.</p>
              
              {/* ✅ ENHANCED BEAUTIFUL LIVE PREVIEW ITEMS */}
              <div className="space-y-3 mb-6">
                {recentSwaps.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No historical transactions logged yet.</p>
                ) : (
                  recentSwaps.map((swap, idx) => {
                    // Extract properties or safe mock parameters cleanly from dynamic fields
                    const barteredSkill = swap.skillRequested || swap.skillOffered || "Skill Exchange";
                    const formattedDate = swap.startDate || swap.createdAt || swap.date || "Recent Entry";
                    const cleanStatus = swap.status ? swap.status.toUpperCase() : "PENDING";

                    // Dynamic chip coloring configurations matching status states
                    const statusStyles = 
                      cleanStatus === "CLOSED" || cleanStatus === "COMPLETED" 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                        : cleanStatus === "ACCEPTED" || cleanStatus === "ACTIVE"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-amber-50 text-amber-700 border-amber-200";

                    return (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100/50 transition">
                        <div>
                          <p className="text-sm font-bold text-gray-800">
                            Barter: <span className="text-indigo-600 font-semibold">{barteredSkill}</span>
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Date: <span className="text-gray-500 font-medium">{formattedDate}</span>
                          </p>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${statusStyles}`}>
                          {cleanStatus}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            <button 
              onClick={() => navigate('/admin/swaps')} 
              className="text-indigo-600 font-bold text-sm flex items-center gap-1 hover:text-indigo-800 mt-2"
            >
              VIEW DETAILS →
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, color }) => (
  <div className={`${color} text-white p-8 rounded-3xl shadow-lg`}>
    <div className="mb-6 p-2 bg-white/20 w-max rounded-xl">{icon}</div>
    <div className="text-5xl font-black">{value}</div>
    <div className="text-lg font-medium opacity-90 mt-1">{label}</div>
  </div>
);

const ActionButton = ({ label, onClick }) => (
  <button 
    onClick={onClick} 
    className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-600 transition duration-200 shadow-lg"
  >
    {label}
  </button>
);

export default AdminDashboard;