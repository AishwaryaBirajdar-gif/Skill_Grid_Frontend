import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import DashboardHome from '../../components/Admin/Pages/DashboardHome';
import UserManagement from '../../components/Admin/Pages/UserManagement';
import SkillManagement from '../../components/Admin/Pages/SkillManagement';
import BarterManagement from '../../components/Admin/Pages/BarterManagement';
import SmartContractMonitoring from '../../components/Admin/Pages/SmartContractMonitoring';
import KarmaPointsManagement from '../../components/Admin/Pages/KarmaPointsManagement';
import BadgeManagement from '../../components/Admin/Pages/BadgeManagement';
import ReportsPage from '../../components/Admin/Pages/ReportsPage';
import AnalyticsPage from '../../components/Admin/Pages/AnalyticsPage';
import NotificationsManagement from '../../components/Admin/Pages/NotificationsManagement';
import SettingsPage from '../../components/Admin/Pages/SettingsPage';
import AIAnalyzerMonitoring from '../../components/Admin/Pages/AIAnalyzerMonitoring';

export default function AdminDashboard() {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardHome />;
      case 'users':
        return <UserManagement />;
      case 'skills':
        return <SkillManagement />;
      case 'exchanges':
        return <BarterManagement />;
      case 'contracts':
        return <SmartContractMonitoring />;
      case 'karma':
        return <KarmaPointsManagement />;
      case 'badges':
        return <BadgeManagement />;
      case 'reports':
        return <ReportsPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'notifications':
        return <NotificationsManagement />;
      case 'settings':
        return <SettingsPage />;
      case 'ai-analyzer':
        return <AIAnalyzerMonitoring />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-40 lg:hidden bg-white p-2 rounded-lg shadow-lg"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <AdminSidebar
        activePage={activePage}
        setActivePage={setActivePage}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
