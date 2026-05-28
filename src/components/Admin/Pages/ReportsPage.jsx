import React, { useState } from 'react';
import { Search, Download, CheckCircle, XCircle, Eye, Edit } from 'lucide-react';

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [reports] = useState([
    {
      id: 1,
      reportedUser: 'User1234',
      reason: 'Inappropriate Content',
      description: 'User posted offensive comments in chat',
      submittedBy: 'User5678',
      status: 'pending',
      date: '2024-03-22'
    },
    {
      id: 2,
      reportedUser: 'User9999',
      reason: 'Fraud',
      description: 'User claiming false credentials and skills',
      submittedBy: 'User2222',
      status: 'resolved',
      date: '2024-03-20'
    },
    {
      id: 3,
      reportedUser: 'User7777',
      reason: 'Harassment',
      description: 'Repeated unwanted messages and threats',
      submittedBy: 'User3333',
      status: 'in-review',
      date: '2024-03-21'
    },
    {
      id: 4,
      reportedUser: 'User4444',
      reason: 'Contract Dispute',
      description: 'User not fulfilling barter agreement',
      submittedBy: 'User6666',
      status: 'pending',
      date: '2024-03-22'
    },
  ]);

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.reportedUser.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Reports & Complaints</h1>
          <p className="text-gray-600 mt-2">Manage user reports and resolve disputes</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">Total Reports</p>
          <p className="text-2xl font-bold text-blue-600">{reports.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-orange-600">{reports.filter(r => r.status === 'pending').length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">In Review</p>
          <p className="text-2xl font-bold text-yellow-600">{reports.filter(r => r.status === 'in-review').length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">Resolved</p>
          <p className="text-2xl font-bold text-green-600">{reports.filter(r => r.status === 'resolved').length}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1 flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg">
            <Search size={20} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search reports..."
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
              <option value="pending">Pending</option>
              <option value="in-review">In Review</option>
              <option value="resolved">Resolved</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Download size={18} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Reported User</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Reason</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Submitted By</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((report) => (
              <tr key={report.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-800">#{report.id}</td>
                <td className="px-6 py-4 text-sm text-gray-700 font-medium">{report.reportedUser}</td>
                <td className="px-6 py-4 text-sm">
                  <span className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                    {report.reason}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{report.description}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{report.submittedBy}</td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    report.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                    report.status === 'in-review' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {report.status.replace('-', ' ').charAt(0).toUpperCase() + report.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{report.date}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-blue-100 rounded-lg text-blue-600" title="View Details">
                      <Eye size={18} />
                    </button>
                    <button className="p-2 hover:bg-green-100 rounded-lg text-green-600" title="Resolve">
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
        <p className="text-sm text-gray-600">Showing {filteredReports.length} of {reports.length} reports</p>
        <div className="flex gap-2">
          <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Previous</button>
          <button className="px-3 py-2 bg-blue-600 text-white rounded-lg">1</button>
          <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Next</button>
        </div>
      </div>
    </div>
  );
}
