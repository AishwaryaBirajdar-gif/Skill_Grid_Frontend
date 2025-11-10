import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // For routing
import { motion } from "framer-motion";
import { Gift, BookOpen, Clock, Users, Plus, Zap, Activity, Layers, CornerDownRight, ThumbsUp, XCircle } from "lucide-react";

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, collection, query, where, getDocs, orderBy, updateDoc, setLogLevel } from 'firebase/firestore';

// Parse Firebase Config
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Convert Firestore timestamp to readable string
const timeAgo = (date) => {
  if (!date || !date.seconds) return 'N/A';
  const now = new Date();
  const past = date.toDate();
  const diffInSeconds = Math.floor((now - past) / 1000);
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return past.toLocaleDateString();
};

function Dashboard() {
  const navigate = useNavigate(); // <-- useNavigate hook

  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("Guest");
  const [isLoading, setIsLoading] = useState(true);

  const [skillsOffered, setSkillsOffered] = useState([]);
  const [skillsWantedCount, setSkillsWantedCount] = useState(0);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [joinedRoomsCount, setJoinedRoomsCount] = useState(0);

  // --- Firebase Initialization & Auth ---
  useEffect(() => {
    // Suppress console error logging for this component to keep it clean, but use 'error' level if logs are necessary
    setLogLevel('error');

    try {
      const app = initializeApp(firebaseConfig);
      const firestore = getFirestore(app);
      const authService = getAuth(app);
      setDb(firestore);
      setAuth(authService);

      const unsubscribe = onAuthStateChanged(authService, async (user) => {
        if (user) {
          setUserId(user.uid);
          setUserName(user.email ? user.email.split('@')[0] : 'User');
          setIsLoading(false);

          await setDoc(doc(firestore, `artifacts/${appId}/users/${user.uid}/profile/main`), {
            name: user.email ? user.email.split('@')[0] : 'User',
            lastLogin: new Date(),
          }, { merge: true });

        } else if (initialAuthToken) {
          await signInWithCustomToken(authService, initialAuthToken);
        } else {
          const anonUser = await signInAnonymously(authService);
          setUserId(anonUser.user.uid);
          setUserName('Anonymous User');
          setIsLoading(false);
        }
      });
      return () => unsubscribe();
    } catch (error) {
      console.error("Firebase Initialization Error:", error);
      setIsLoading(false);
    }
  }, []);

  // --- Fetch Dashboard Data ---
  useEffect(() => {
    if (!db || !userId) return;

    // 1. My Skills Offered
    const skillsPath = `artifacts/${appId}/users/${userId}/skills`;
    const skillsQuery = query(collection(db, skillsPath));
    const unsubscribeSkills = onSnapshot(skillsQuery, (snapshot) => {
      setSkillsOffered(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => console.error("Error fetching skills:", error));

    // 2. Pending Requests (where I am the receiver)
    const requestsPath = `artifacts/${appId}/public/data/exchanges`;
    const requestsQuery = query(
      collection(db, requestsPath),
      where("receiverId", "==", userId),
      where("status", "==", "pending"),
      // Note: We use in-memory sorting to avoid potential Firestore index issues with orderBy("timestamp", "desc")
    );
    const unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort in memory by timestamp descending
      const sortedRequests = requests.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
      setPendingRequests(sortedRequests);
      // Joined rooms count is placeholder logic for now
      setJoinedRoomsCount(sortedRequests.length + 1);
    }, (error) => console.error("Error fetching requests:", error));

    // 3. All Skills Wanted Count (Placeholder - typically should query a specific collection if one exists)
    // Using a hypothetical public collection for skills wanted
    const allSkillsPath = `artifacts/${appId}/public/data/skills_wanted`;
    getDocs(query(collection(db, allSkillsPath))).then(snapshot => {
      setSkillsWantedCount(snapshot.size);
    }).catch(e => console.error("Error fetching wanted skill count:", e));

    return () => {
      unsubscribeSkills();
      unsubscribeRequests();
    };
  }, [db, userId]);

  // --- Dashboard Actions ---
  const handleAddSkill = () => {
    navigate("/skill-form"); // <-- navigate to SkillForm page
  };

  const handleViewAllRequests = () => {
    navigate("/exchange-form"); // <-- navigate to ExchangeForm page
  };

  const handleRequestAction = async (requestId, status) => {
    if (!db) return;
    try {
      const requestDocRef = doc(db, `artifacts/${appId}/public/data/exchanges`, requestId);
      await updateDoc(requestDocRef, {
        status: status,
        updatedAt: new Date()
      });
      // console.log(`Request ${requestId} ${status}ed`);
    } catch (e) {
      console.error(`Error updating request status to ${status}:`, e);
    }
  };

  // Stats definition remains the same
  const stats = [
    { icon: <Gift size={24} />, label: "Skills Offered", value: skillsOffered.length, color: "#7A42D7", iconBg: "#F3E8FF" },
    { icon: <BookOpen size={24} />, label: "Wanted Skills Found", value: skillsWantedCount, color: "#1ABC9C", iconBg: "#D1FAE5" },
    { icon: <Clock size={24} />, label: "Pending Requests", value: pendingRequests.length, color: "#E74C3C", iconBg: "#FEE2E2" },
    { icon: <Users size={24} />, label: "Active Connections", value: joinedRoomsCount, color: "#3498DB", iconBg: "#D6E6FA" },
  ];

  // Animation variants
  const containerVariants = { 
    hidden: { opacity: 0 }, 
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.07 
      } 
    } 
  };
  const itemVariants = { 
    hidden: { y: 30, opacity: 0 }, 
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 12 
      } 
    } 
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <p className="text-xl font-semibold text-indigo-700">Initializing SkillSwap...</p>
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mx-auto mt-6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <style>{`
        /* Custom Styles for better visual appeal */
        .navbar {
          background-color: #ffffff;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.03);
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .brand {
          font-weight: 700;
          font-size: 1.5rem;
          color: #4f46e5;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: color 0.2s;
        }
        .brand:hover { color: #3730a3; }
        .nav-links a {
          margin: 0 1rem;
          color: #4b5563;
          font-weight: 500;
          transition: color 0.2s;
        }
        .nav-links a:hover { color: #4f46e5; }
        .user-greeting {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0.5rem 1rem;
          border-radius: 9999px;
          background-color: #eef2ff;
          color: #4f46e5;
          font-weight: 600;
        }

        .welcome-card {
          background-image: linear-gradient(135deg, #4f46e5 0%, #a78bfa 100%);
          color: white;
          padding: 2.5rem;
          border-radius: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          box-shadow: 0 20px 25px -5px rgba(79, 70, 229, 0.3), 0 8px 10px -6px rgba(79, 70, 229, 0.3);
        }
        .welcome-card h1 {
          font-size: 2.25rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
        }
        .welcome-card p {
          opacity: 0.8;
          font-size: 0.875rem;
        }

        .add-skill-btn {
          background-color: white;
          color: #4f46e5;
          font-weight: 700;
          padding: 0.75rem 1.5rem;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .add-skill-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 10px rgba(0, 0, 0, 0.15);
        }

        /* Stats Card Styling */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .stat-card {
          background-color: white;
          padding: 1.5rem;
          border-radius: 1rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
        }
        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }
        .stat-card h2 {
          font-size: 2rem;
          font-weight: 700;
          color: #1f2937;
        }
        .stat-card p {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }

        /* Content Row & Columns */
        .content-row {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
        }
        @media (max-width: 1024px) {
          .content-row {
            grid-template-columns: 1fr;
          }
        }
        .left-column-section, .section {
          background-color: white;
          padding: 1.5rem;
          border-radius: 1rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
        }
        .right-column-stack {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 1rem;
          border-bottom: 2px solid #f3f4f6;
          padding-bottom: 0.5rem;
        }

        /* Skill List Item */
        .skill-list-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          margin-bottom: 0.75rem;
          transition: background-color 0.2s, box-shadow 0.2s;
        }
        .skill-list-item:hover {
          background-color: #f9fafb;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
        }
        .skill-name {
          font-weight: 600;
          color: #4f46e5;
        }
        .skill-level {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          background-color: #eef2ff;
          color: #4f46e5;
        }

        /* Request Item */
        .request-item {
          padding: 1.25rem;
          border-radius: 0.75rem;
          border-left: 4px solid #E74C3C;
          background-color: #fef2f2;
          margin-bottom: 1rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        .request-header {
          margin-bottom: 0.75rem;
        }
        .request-buttons {
          margin-top: 1rem;
          display: flex;
          gap: 0.75rem;
        }
        .request-buttons button {
          padding: 0.5rem 1rem;
          border-radius: 9999px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: background-color 0.2s, transform 0.1s;
        }
        .request-buttons .accept {
          background-color: #1ABC9C;
          color: white;
        }
        .request-buttons .accept:hover {
          background-color: #16a085;
          transform: translateY(-1px);
        }
        .request-buttons .decline {
          background-color: #e7e5e7;
          color: #E74C3C;
          border: 1px solid #E74C3C;
        }
        .request-buttons .decline:hover {
          background-color: #E74C3C;
          color: white;
        }

        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          color: #9ca3af;
          border: 1px dashed #d1d5db;
          border-radius: 0.75rem;
          margin-top: 1rem;
          font-style: italic;
        }
      `}</style>
      
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10" 
        variants={containerVariants} 
        initial="hidden" 
        animate="visible"
      >
        {/* Navbar */}
        <div className="navbar">
          <div className="brand" onClick={() => navigate("/")}>
            <Layers size={24} />SkillSwap
          </div>
          <div className="nav-links hidden sm:flex">
            <a href="#" onClick={() => navigate("/browse-skill")}>Browse Skills</a>
            <a href="#" onClick={handleViewAllRequests}>My Requests</a>
          </div>
          <div className="user-greeting cursor-pointer" onClick={() => navigate("/profile")}>
            <Zap size={18} /> {userName}
          </div>
        </div>

        {/* Welcome Card */}
        <div className="mt-8">
            <motion.div className="welcome-card" variants={itemVariants}>
                <div>
                    <h1 className="text-white text-3xl sm:text-4xl">Hello, {userName}!</h1>
                    <p className="mt-1 text-indigo-100">Your current user ID: <strong className="font-mono text-xs bg-indigo-500/50 px-2 py-0.5 rounded">{userId}</strong></p>
                </div>
                <button className="add-skill-btn" onClick={handleAddSkill}>
                    <Plus size={18} /> Offer New Skill
                </button>
            </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          {stats.map((item, i) => (
            <motion.div className="stat-card" key={i} variants={itemVariants}>
              <div className="stat-icon" style={{ background: item.iconBg, color: item.color }}>{item.icon}</div>
              <h2>{item.value}</h2>
              <p>{item.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Content Row */}
        <div className="content-row">
          {/* Skills Offered */}
          <motion.div className="left-column-section" variants={itemVariants}>
            <h3>My Skills Offered ({skillsOffered.length})</h3>
            <div className="max-h-[600px] overflow-y-auto pr-2">
            {skillsOffered.length > 0 ? (
              skillsOffered.map(skill => (
                <div key={skill.id} className="skill-list-item cursor-pointer" onClick={() => navigate(`/skill-form?skillId=${skill.id}`)}>
                  <div className="flex flex-col">
                    <span className="skill-name">{skill.name}</span>
                    <span className="text-xs text-gray-500 mt-1">{skill.description?.substring(0, 50)}...</span>
                  </div>
                  <span className="skill-level">{skill.level}</span>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <Gift size={28} className="mx-auto mb-2 text-indigo-400"/>
                No skills listed yet. Click 'Offer New Skill' above to start exchanging!
              </div>
            )}
            </div>
          </motion.div>

          {/* Right Column */}
          <div className="right-column-stack">
            {/* Pending Requests */}
            <motion.div className="section" variants={itemVariants}>
              <div className="flex justify-between items-center">
                <h3>Incoming Requests ({pendingRequests.length})</h3>
                <a href="#" className="text-sm font-semibold text-red-600 hover:text-red-700 transition" onClick={handleViewAllRequests}>View All</a>
              </div>
              <div className="max-h-[300px] overflow-y-auto pr-2">
              {pendingRequests.length > 0 ? (
                pendingRequests.map(req => (
                  <div key={req.id} className="request-item">
                    <div className="request-header flex justify-between items-start">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <CornerDownRight size={18} className="text-[#E74C3C] min-w-4"/>
                            <span className="font-bold text-sm text-[#E74C3C]">{req.requestedSkill || 'Skill X'}</span>
                        </div>
                        <p className="text-xs text-gray-700 ml-6">
                           From: <span className="font-mono bg-gray-200 px-1 rounded text-xs">{req.requesterId?.substring(0,8)+'...' || 'Unknown'}</span>
                        </p>
                      </div>
                      <div className="text-xs text-gray-500 min-w-16 text-right">{timeAgo(req.timestamp)}</div>
                    </div>
                    
                    <div className="request-buttons">
                      <button className="accept" onClick={() => handleRequestAction(req.id, 'accepted')}>
                        <ThumbsUp size={16}/> Accept
                      </button>
                      <button className="decline" onClick={() => handleRequestAction(req.id, 'declined')}>
                        <XCircle size={16}/> Decline
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <Clock size={28} className="mx-auto mb-2 text-gray-400"/>
                  You have no pending exchange requests. Time to relax!
                </div>
              )}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Dashboard;