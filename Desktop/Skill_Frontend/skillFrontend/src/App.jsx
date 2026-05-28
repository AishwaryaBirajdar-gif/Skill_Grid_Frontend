import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Components
import HomePage from "./component/HomePage.jsx";
import Login from "./component/login.jsx";
import Signup from "./component/Signup.jsx";
import Dashboard from "./component/Dashboard.jsx";
import Browse from "./component/Browse.jsx";
import LearningRooms from "./pages/LearningRooms"; // ✅ ADD THIS IMPORT
// Pages 
import Profile from "./pages/Profile.jsx";
import BrowseSkill from "./pages/BrowseSkill.jsx";
import ExchangeForm from "./pages/ExchangeForm.jsx";
import SkillForm from "./pages/SkillForm.jsx";
import Requests from './pages/Requests';
import MyRequests from './pages/MyRequests';
import ChatPage from './component/ChatPage'; // Using this for the main chat logic
import Suggestions from "./pages/Suggestions.jsx";
import AIPathPage from "./pages/AIPathPage";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState({ name: "Guest" });

  const handleLoginSuccess = (userData) => {
    setIsLoggedIn(true);
    setCurrentUser(userData);
    console.log("Login/Signup successful for user:", userData.name || userData.email);
  };

  return (
    <Router>
      <Routes>
        {/* Core Auth & Main Routes */}
        <Route path="/" element={<HomePage isLoggedIn={isLoggedIn} />} />
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/signup" element={<Signup onSignupSuccess={handleLoginSuccess} />} />
        <Route path="/dashboard" element={<Dashboard user={currentUser} />} />
        
        {/* Profile & Skills */}
        <Route path="/profile" element={<Profile user={currentUser} />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/browse-skill" element={<BrowseSkill user={currentUser} />} />
        <Route path="/skill-form" element={<SkillForm user={currentUser} />} />
        
        {/* Barter & Requests */}
        <Route path="/exchange-form" element={<ExchangeForm user={currentUser} />} />
        <Route path="/requests" element={<Requests />} />
        <Route path="/my-requests" element={<MyRequests />} />
<Route path="/suggestions" element={<Suggestions user={currentUser} />} />[cite: 22]        {/* ✅ Single Chat Route: Matches the requestId logic in ChatPage.jsx */}
        <Route path="/chat/:requestId" element={<ChatPage />} />
        <Route path="/ai-path" element={<AIPathPage />} />

{/* ✅ Updated Learning Rooms Route */}
        <Route path="/learning-rooms" element={<LearningRooms />} />        
        {/* ✅ SAFETY CATCH-ALL */}
        <Route 
          path="*" 
          element={
            <div className="flex items-center justify-center h-screen font-bold text-red-500">
              Router Error: The path "{window.location.pathname}" is not defined in App.jsx
            </div>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;