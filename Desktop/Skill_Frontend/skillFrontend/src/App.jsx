import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Components
import HomePage from "./component/HomePage.jsx";
import Login from "./component/login.jsx";
import Signup from "./component/Signup.jsx";
import Dashboard from "./component/Dashboard.jsx";
import Browse from "./component/Browse.jsx";
import ChatPage from "./component/ChatPage.jsx";

// Pages
import Profile from "./pages/Profile.jsx";
import BrowseSkill from "./pages/BrowseSkill.jsx";
import ExchangeForm from "./pages/ExchangeForm.jsx";
import SkillForm from "./pages/SkillForm.jsx";
import Requests from "./pages/Requests";
import MyRequests from "./pages/MyRequests";
import Suggestions from "./pages/Suggestions.jsx";
import AIPathPage from "./pages/AIPathPage";
import LearningRooms from "./pages/LearningRooms";

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard.jsx";
import ManageUsers from "./pages/ManageUsers";
import PlatformMessages from "./pages/PlatformMessages";
import ViewReports from "./pages/ViewReports";
import PendingSkills from "./pages/PendingSkills";
import RecentSwaps from "./pages/RecentSwaps.jsx";

// Community Barter
import CommunityBarter from "./pages/CommunityBarter";
import CommunityRoom from "./pages/CommunityRoom";

// Admin Protection Wrapper
const AdminRoute = ({ children }) => {
  const role = localStorage.getItem("userRole");
  return role === "ADMIN" ? children : <Navigate to="/dashboard" />;
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const [currentUser, setCurrentUser] = useState({
    name: localStorage.getItem("userName") || "Guest",
    role: localStorage.getItem("userRole"),
  });

  const handleLoginSuccess = (userData) => {
    setIsLoggedIn(true);
    setCurrentUser(userData);

    localStorage.setItem("userRole", userData.role);
    localStorage.setItem("userName", userData.name);

    console.log("Login/Signup successful for user:", userData.name);
  };

  return (
    <Router>
      <Routes>
        {/* Core Routes */}
        <Route path="/" element={<HomePage isLoggedIn={isLoggedIn} />} />

        <Route
          path="/login"
          element={<Login onLoginSuccess={handleLoginSuccess} />}
        />

        <Route
          path="/signup"
          element={<Signup onSignupSuccess={handleLoginSuccess} />}
        />

        <Route
          path="/dashboard"
          element={
            isLoggedIn ? (
              <Dashboard user={currentUser} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Profile & Skills */}
        <Route path="/profile" element={<Profile user={currentUser} />} />
        <Route path="/browse" element={<Browse />} />
        <Route
          path="/browse-skill"
          element={<BrowseSkill user={currentUser} />}
        />
        <Route
          path="/skill-form"
          element={<SkillForm user={currentUser} />}
        />

        {/* Exchange */}
        <Route
          path="/exchange-form"
          element={<ExchangeForm user={currentUser} />}
        />

        <Route path="/requests" element={<Requests />} />
        <Route path="/my-requests" element={<MyRequests />} />
        <Route
          path="/suggestions"
          element={<Suggestions user={currentUser} />}
        />

        <Route path="/chat/:requestId" element={<ChatPage />} />
        <Route path="/ai-path" element={<AIPathPage />} />

        {/* Community Barter */}
        <Route path="/community-barter" element={<CommunityBarter />} />
        <Route
          path="/community-room/:barterId"
          element={<CommunityRoom />}
        />

        {/* Learning Rooms */}
        <Route path="/learning-rooms" element={<LearningRooms />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <ManageUsers />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/messages"
          element={
            <AdminRoute>
              <PlatformMessages />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/reports"
          element={
            <AdminRoute>
              <ViewReports />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/pending-skills"
          element={
            <AdminRoute>
              <PendingSkills />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/swaps"
          element={
            <AdminRoute>
              <RecentSwaps />
            </AdminRoute>
          }
        />

        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="flex items-center justify-center h-screen font-bold text-red-500">
              Router Error: The path "{window.location.pathname}" is not
              defined in App.jsx
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;