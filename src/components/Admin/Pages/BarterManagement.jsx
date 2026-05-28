import React, { useState } from 'react';
import { Search, Download, CheckCircle, XCircle, Eye, Edit } from 'lucide-react';

export default function BarterManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [exchanges] = useState([
    {
      id: 1,
      userA: 'John Doe',
      userB: 'Jane Smith',
      offeredSkill: 'React.js',
      requestedSkill: 'UI Design',
      karma: 500,
      contractStatus: 'active',
      exchangeStatus: 'completed',
      date: '2024-03-20'
    },
    {
      id: 2,
      userA: 'Mike Johnson',
      userB: 'Sarah Lee',
      offeredSkill: 'Backend Dev',
      requestedSkill: 'Web Design',
      karma: 750,
      contractStatus: 'pending',
      exchangeStatus: 'in-progress',
      date: '2024-03-18'
    },
    {
      id: 3,
      userA: 'Sarah Lee',
      userB: 'John Doe',
      offeredSkill: 'UI Design',
      requestedSkill: 'JavaScript',
      karma: 600,
      contractStatus: 'failed',
      exchangeStatus: 'cancelled',
      date: '2024-03-15'
    },
    {
      id: 4,
      userA: 'Jane Smith',
      userB: 'Mike Johnson',
      offeredSkill: 'Database Design',
      requestedSkill: 'Mobile Dev',
      karma: 800,
      contractStatus: 'active',
      exchangeStatus: 'completed',
      date: '2024-03-22'
    },
  ]);

  const filteredExchanges = exchanges.filter(exchange => {
    const matchesSearch = exchange.userA.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exchange.userB.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || exchange.exchangeStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Barter/Exchange Management</h1>
          <p className="text-gray-600 mt-2">Monitor and manage all skill exchanges</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1 flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg">
            <Search size={20} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search exchanges..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent outline-none text-gray-700"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="in-progress">In Progress</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Download size={18} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Exchanges Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">User A</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">User B</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Offered</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Requested</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Karma</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Contract</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Exchange</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredExchanges.map((exchange) => (
              <tr key={exchange.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-800">#{exchange.id}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{exchange.userA}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{exchange.userB}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{exchange.offeredSkill}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{exchange.requestedSkill}</td>
                <td className="px-6 py-4">
                  <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                    {exchange.karma} pts
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    exchange.contractStatus === 'active' ? 'bg-green-100 text-green-800' :
                    exchange.contractStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {exchange.contractStatus.charAt(0).toUpperCase() + exchange.contractStatus.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    exchange.exchangeStatus === 'completed' ? 'bg-green-100 text-green-800' :
                    exchange.exchangeStatus === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {exchange.exchangeStatus.replace('-', ' ').charAt(0).toUpperCase() + exchange.exchangeStatus.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{exchange.date}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-blue-100 rounded-lg text-blue-600" title="View">
                      <Eye size={18} />
                    </button>
                    <button className="p-2 hover:bg-green-100 rounded-lg text-green-600" title="Approve">
                      <CheckCircle size={18} />
                    </button>
                    <button className="p-2 hover:bg-red-100 rounded-lg text-red-600" title="Reject">
                      <XCircle size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between bg-white rounded-lg shadow-md p-4">
        <p className="text-sm text-gray-600">Showing {filteredExchanges.length} of {exchanges.length} exchanges</p>
        <div className="flex gap-2">
          <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Previous</button>
          <button className="px-3 py-2 bg-blue-600 text-white rounded-lg">1</button>
          <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Next</button>
        </div>
      </div>
    </div>
  );
}
