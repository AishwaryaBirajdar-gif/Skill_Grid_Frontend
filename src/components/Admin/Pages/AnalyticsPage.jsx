import React, { useState } from 'react';
import { Download, TrendingUp, Users, Briefcase, Zap, Brain } from 'lucide-react';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('month');

  const analyticsData = {
    topSkills: [
      { name: 'React.js', count: 245, trend: '+12%' },
      { name: 'UI/UX Design', count: 198, trend: '+8%' },
      { name: 'Backend Dev', count: 176, trend: '+15%' },
      { name: 'Mobile Dev', count: 154, trend: '+5%' },
      { name: 'Data Science', count: 132, trend: '+22%' },
    ],
    trendingCategories: [
      { name: 'Web Development', users: 450, growth: '+18%' },
      { name: 'Design', users: 380, growth: '+12%' },
      { name: 'Backend', users: 320, growth: '+9%' },
      { name: 'Mobile', users: 290, growth: '+14%' },
    ],
    mostDemandedSkills: [
      { name: 'React.js', demand: 234 },
      { name: 'UI Design', demand: 198 },
      { name: 'Python', demand: 176 },
      { name: 'Mobile Dev', demand: 165 },
    ],
    engagement: {
      activeUsers: 892,
      totalBarters: 5432,
      successRate: 94.2,
      peakHour: '2-3 PM'
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Analytics & Insights</h1>
          <p className="text-gray-600 mt-2">Platform performance and user engagement metrics</p>
        </div>
        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-3xl font-bold text-blue-600">{analyticsData.engagement.activeUsers}</p>
            </div>
            <Users size={40} className="text-blue-200" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Barters</p>
              <p className="text-3xl font-bold text-green-600">{analyticsData.engagement.totalBarters}</p>
            </div>
            <Zap size={40} className="text-green-200" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-3xl font-bold text-purple-600">{analyticsData.engagement.successRate}%</p>
            </div>
            <TrendingUp size={40} className="text-purple-200" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Peak Activity</p>
              <p className="text-2xl font-bold text-orange-600">{analyticsData.engagement.peakHour}</p>
            </div>
            <Brain size={40} className="text-orange-200" />
          </div>
        </div>
      </div>

      {/* Top Skills and Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Top Skills</h3>
          <div className="space-y-3">
            {analyticsData.topSkills.map((skill, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-800">{skill.name}</span>
                    <span className="text-green-600 text-sm font-semibold">{skill.trend}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
                      style={{ width: `${(skill.count / 250) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{skill.count} requests</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Trending Categories</h3>
          <div className="space-y-3">
            {analyticsData.trendingCategories.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{category.name}</p>
                  <p className="text-sm text-gray-600">{category.users} users</p>
                </div>
                <span className="text-green-600 font-bold">{category.growth}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Most Demanded Skills */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Most Demanded Skills</h3>
        <div className="space-y-3">
          {analyticsData.mostDemandedSkills.map((skill, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="font-medium text-gray-800">#{index + 1} {skill.name}</span>
              <div className="flex items-center gap-4">
                <div className="w-64 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-400 to-purple-600"
                    style={{ width: `${(skill.demand / 250) * 100}%` }}
                  />
                </div>
                <span className="font-bold text-gray-800 w-16">{skill.demand}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Analyzer Trends */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Brain size={24} className="text-purple-600" />
          AI Skill Analysis Trends
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="font-semibold text-purple-900">Avg Confidence Score</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">94.2%</p>
          </div>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="font-semibold text-blue-900">Skills Analyzed Today</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">156</p>
          </div>
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="font-semibold text-green-900">Accuracy Rate</p>
            <p className="text-3xl font-bold text-green-600 mt-2">96.8%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
