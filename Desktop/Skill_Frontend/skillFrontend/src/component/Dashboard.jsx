import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axiosInstance from "../api/axiosInstance"; 
import { 
  Gift, BookOpen, Clock, Users, Zap, Layers, 
  Home, Search, MessageSquare, LayoutDashboard, Send, Award, TrendingUp, Sparkles, Bell, ArrowRightLeft
} from "lucide-react";

function Dashboard() {
  const navigate = useNavigate();

  const userId = localStorage.getItem('userId') || localStorage.getItem('skillgrid_userId'); 
  const [userName, setUserName] = useState(localStorage.getItem('userName') || "User");
  const [isLoading, setIsLoading] = useState(true);

  const [stats, setStats] = useState({
    offered: 0,
    wanted: 0
  });

  const [pendingRequestsCount, setPendingRequestsCount] = useState(0); 
  const [incomingPendingCount, setIncomingPendingCount] = useState(0); 
  const [sentRequests, setSentRequests] = useState([]); 
  const [activeConnections, setActiveConnections] = useState(0);
  const [matchesCount, setMatchesCount] = useState(0); 

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userId || userId === "undefined") {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const userRes = await axiosInstance.get(`/user/${userId}`);
        const user = userRes.data;

        const incomingRes = await axiosInstance.get(`/requests/my-requests/${userId}`);
        const incoming = incomingRes.data;
        
        const sentRes = await axiosInstance.get(`/requests/sent/${userId}`);
        const sent = sentRes.data;

        const pendingIncoming = incoming.filter(req => req.status === "PENDING");
        const pendingSent = sent.filter(req => req.status === "PENDING");
        const totalPending = pendingIncoming.length + pendingSent.length;

        const connectionsCount = [
          ...incoming.filter(req => req.status === "ACCEPTED"),
          ...sent.filter(req => req.status === "ACCEPTED")
        ].length;

        const allUsersRes = await axiosInstance.get('/user/browse?skill='); 
        const myWants = user.skillsWanted || [];
        const myOffers = user.skillsOffered || [];
        
        const potentialMatches = allUsersRes.data.filter(u => {
            if (u.id === userId) return false;
            const theyHaveWhatIWant = u.skillsOffered?.some(s => myWants.includes(s));
            const theyWantWhatIHave = u.skillsWanted?.some(s => myOffers.includes(s));
            return theyHaveWhatIWant && theyWantWhatIHave;
        });

        setStats({
          offered: user.skillsOffered?.length || 0,
          wanted: user.skillsWanted?.length || 0
        });
        
        setPendingRequestsCount(totalPending);
        setIncomingPendingCount(pendingIncoming.length);
        setSentRequests(sent); 
        setActiveConnections(connectionsCount);
        setMatchesCount(potentialMatches.length);
        setUserName(user.name || "User");
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-xl font-bold text-indigo-700 uppercase tracking-widest">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans">
      <nav className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-2xl font-black text-indigo-600 cursor-pointer w-1/4" onClick={() => navigate("/")}>
            <Layers size={28} /> SkillGrid
          </div>
          <div className="hidden md:flex items-center justify-center gap-8 text-sm font-bold text-slate-500 flex-1">
            <button onClick={() => navigate("/")} className="flex items-center gap-2 hover:text-indigo-600 transition-colors"><Home size={18}/> Home</button>
            <button onClick={() => navigate("/browse-skill")} className="flex items-center gap-2 hover:text-indigo-600 transition-colors"><Search size={18}/> Browse Skills</button>
            <button onClick={() => navigate("/my-requests")} className="flex items-center gap-2 hover:text-indigo-600 transition-colors"><MessageSquare size={18}/> My Requests</button>
            <button className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-5 py-2.5 rounded-2xl"><LayoutDashboard size={18}/> Dashboard</button>
          </div>
          <div className="flex justify-end w-1/4">
            <div className="flex items-center gap-3 bg-slate-100 px-5 py-2.5 rounded-full cursor-pointer hover:bg-indigo-100 transition-all border border-transparent" onClick={() => navigate("/profile")}>
              <Zap size={16} className="text-indigo-600" />
              <span className="text-sm font-black text-slate-700 uppercase tracking-tight">{userName}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-12 space-y-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 rounded-[3rem] p-16 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-5xl font-black mb-4 tracking-tight">Hello, {userName}! 👋</h1>
            <p className="text-indigo-100 text-lg font-medium opacity-90 max-w-2xl leading-relaxed">
              Your community is active! You are currently offering <strong>{stats.offered}</strong> skills.
            </p>
          </div>
          <Sparkles className="absolute right-10 top-10 text-white opacity-10 w-48 h-48" />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatCard icon={<Gift />} label="Skills Offered" value={stats.offered} color="text-indigo-600" bg="bg-indigo-50" />
          <StatCard icon={<BookOpen />} label="Wanted Found" value={stats.wanted} color="text-emerald-600" bg="bg-emerald-50" />
          <StatCard icon={<Clock />} label="Pending Requests" value={pendingRequestsCount} color="text-rose-600" bg="bg-rose-50" />
          <StatCard icon={<Users />} label="Connections" value={activeConnections} color="text-blue-600" bg="bg-blue-50" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <BigBox 
            title="Smart Matches" 
            desc="Find partners who want what you teach and offer what you need." 
            icon={<ArrowRightLeft size={40} className="text-amber-500" />} 
            badge={matchesCount > 0 ? `${matchesCount} Matches` : null} 
            onClick={() => navigate("/suggestions")} 
          />
          <BigBox 
            title="Incoming Requests" 
            desc={`You have ${incomingPendingCount} requests waiting for approval.`} 
            icon={<Bell size={40} className="text-rose-500" />} 
            badge={incomingPendingCount > 0 ? `${incomingPendingCount} New` : null} 
            onClick={() => navigate("/my-requests")} 
          />
          <BigBox 
            title="Active Rooms" 
            desc="Ongoing exchanges. Jump back into your chats." 
            icon={<MessageSquare size={40} className="text-emerald-500" />} 
            onClick={() => navigate("/my-requests")} 
          />
          <BigBox 
            title="Trending Skills" 
            desc="Explore popular skills on SkillGrid." 
            icon={<TrendingUp size={40} className="text-violet-500" />} 
            onClick={() => navigate("/browse-skill")} 
          />
          
          {/* New AI Path Suggestion Box */}
          <BigBox 
            title="AI Path Suggestion" 
            desc="Get a personalized learning roadmap based on your current skills." 
            icon={<Sparkles size={40} className="text-indigo-500" />} 
            onClick={() => {
    // Save the FULL list of offered skills
    localStorage.setItem('userSkills', stats.offeredSkills || ""); 
    navigate("/ai-path");
  }} 
          />

          {/* New Skill Demand Forecasting Box */}
          <BigBox 
            title="Skill Demand Forecasting" 
            desc="See which skills will be most valuable in the coming months." 
            icon={<Zap size={40} className="text-blue-500" />} 
            onClick={() => navigate("/skill-demand")} 
          />
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ icon, label, value, color, bg }) => (
  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-lg transition-all">
    <div className={`w-14 h-14 ${bg} ${color} rounded-2xl flex items-center justify-center mb-6`}>
      {React.cloneElement(icon, { size: 28 })}
    </div>
    <div className="text-4xl font-black text-slate-800 mb-1">{value}</div>
    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">{label}</div>
  </div>
);

const BigBox = ({ title, desc, icon, badge, onClick }) => (
  <div onClick={onClick} className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm hover:border-indigo-400 hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden">
    {badge && <span className="absolute top-8 right-8 bg-rose-500 text-white text-[11px] font-black px-4 py-1.5 rounded-full">{badge}</span>}
    <div className="flex flex-col gap-8">
      <div className="w-20 h-20 bg-slate-50 rounded-[1.8rem] flex items-center justify-center group-hover:bg-indigo-50 transition-all">{icon}</div>
      <div>
        <h3 className="text-3xl font-black text-slate-800 mb-4">{title}</h3>
        <p className="text-slate-500 font-medium text-lg">{desc}</p>
        <div className="mt-8 text-indigo-600 text-xs font-black uppercase tracking-widest">View Details →</div>
      </div>
    </div>
  </div>
);

export default Dashboard