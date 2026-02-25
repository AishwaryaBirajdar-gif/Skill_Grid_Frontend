import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// ✅ FIXED IMPORTS: These files are in your 'component' folder according to your image
import HomePage from "./component/HomePage.jsx";
import Login from "./component/Login.jsx";
import Signup from "./component/Signup.jsx";
import Dashboard from "./component/Dashboard.jsx";
import Browse from "./component/Browse.jsx"; // Moved from ./pages/ to ./component/

// Pages (Assuming these are actually in your 'pages' folder)
import Profile from "./pages/Profile.jsx";
import BrowseSkill from "./pages/BrowseSkill.jsx";
import ExchangeForm from "./pages/ExchangeForm.jsx";
import SkillForm from "./pages/SkillForm.jsx";
import Requests from './pages/Requests';

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
        <Route path="/" element={<HomePage isLoggedIn={isLoggedIn} />} />
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/signup" element={<Signup onSignupSuccess={handleLoginSuccess} />} />
        <Route path="/dashboard" element={<Dashboard user={currentUser} />} />
        <Route path="/profile" element={<Profile user={currentUser} />} />
        <Route path="/browse" element={<Browse />} />

        {/* New pages */}
        <Route path="/browse-skill" element={<BrowseSkill user={currentUser} />} />
        <Route path="/exchange-form" element={<ExchangeForm user={currentUser} />} />
        <Route path="/skill-form" element={<SkillForm user={currentUser} />} />
        <Route path="/requests" element={<Requests />} />
      </Routes>
    </Router>
  );
}

export default App;