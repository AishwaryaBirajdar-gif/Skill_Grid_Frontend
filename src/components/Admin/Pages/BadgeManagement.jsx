import React, { useState } from 'web';
import { Search, Download, Trash2, Plus, Edit } from 'lucide-react';

export default function BadgeManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [badges] = useState([
    {
      id: 1,
      name: 'Expert Developer',
      criteria: 'Complete 10 successful barterings in backend',
      usersEarned: 124,
      createdDate: '2024-01-15',
      icon: '🚀'
    },
    {
      id: 2,
      name: 'UI Master',
      criteria: 'Receive 5-star rating on 5 UI design barterings',
      usersEarned: 89,
      createdDate: '2024-02-10',
      icon: '🎨'
    },
    {
      id: 3,
      name: 'Karma Collector',
      criteria: 'Accumulate 1000 karma points',
      usersEarned: 245,
      createdDate: '2024-01-20',
      icon: '⭐'
    },
    {
      id: 4,
      name: 'Team Player',
      criteria: 'Complete 3 group barterings',
      usersEarned: 56,
      createdDate: '2024-03-01',
      icon: '🤝'
    },
    {
      id: 5,
      name: 'Beginner',
      criteria: 'Complete first bartering',
      usersEarned: 892,
      createdDate: '2024-01-01',
      icon: '🌱'
    },
  ]);

  const filteredBadges = badges.filter(badge =>
    badge.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Badge Management</h1>
          <p className="text-gray-600 mt-2">Create and manage achievement badges</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus size={18} />
          Create Badge
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search badges..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent outline-none text-gray-700"
          />
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBadges.map((badge) => (
          <div key={badge.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="text-4xl">{badge.icon}</div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-blue-100 rounded-lg text-blue-600" title="Edit">
                  <Edit size={18} />
                </button>
                <button className="p-2 hover:bg-red-100 rounded-lg text-red-600" title="Delete">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">{badge.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{badge.criteria}</p>
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Users Earned</span>
                <span className="font-bold text-purple-600">{badge.usersEarned}</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-gray-600">Created</span>
                <span className="text-gray-700">{badge.createdDate}</span>
              </div>
            </div>
            <button className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">
              Assign Manually
            </button>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">Total Badges</p>
          <p className="text-2xl font-bold text-blue-600">{badges.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">Total Awards Issued</p>
          <p className="text-2xl font-bold text-green-600">{badges.reduce((sum, b) => sum + b.usersEarned, 0)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">Most Popular</p>
          <p className="text-lg font-bold text-purple-600">{badges.sort((a, b) => b.usersEarned - a.usersEarned)[0].name}</p>
        </div>
      </div>
    </div>
  );
}
