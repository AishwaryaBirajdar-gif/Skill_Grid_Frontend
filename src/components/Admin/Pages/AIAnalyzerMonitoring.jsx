import React, { useState } from 'react';
import { Search, Download, CheckCircle, AlertCircle, Brain } from 'lucide-react';

export default function AIAnalyzerMonitoring() {
  const [searchTerm, setSearchTerm] = useState('');
  const [analyses] = useState([
    {
      id: 1,
      skillName: 'React.js Mastery',
      skillOwner: 'John Doe',
      description: 'Advanced React concepts including hooks, context API...',
      aiConfidence: 94,
      suggestedCategory: 'Web Development',
      flagged: false,
      analyzedDate: '2024-03-22',
      status: 'approved'
    },
    {
      id: 2,
      skillName: 'Quick Python Tips',
      skillOwner: 'Mike Johnson',
      description: 'Random Python tips without clear learning path',
      aiConfidence: 45,
      suggestedCategory: 'Backend',
      flagged: true,
      analyzedDate: '2024-03-22',
      status: 'flagged'
    },
    {
      id: 3,
      skillName: 'UI/UX Design Excellence',
      skillOwner: 'Sarah Lee',
      description: 'Complete guide to modern UI/UX design practices',
      aiConfidence: 92,
      suggestedCategory: 'Design',
      flagged: false,
      analyzedDate: '2024-03-21',
      status: 'approved'
    },
    {
      id: 4,
      skillName: 'Generic Skills',
      skillOwner: 'Unknown User',
      description: 'Skills and stuff for learning and things',
      aiConfidence: 32,
      suggestedCategory: 'Uncategorized',
      flagged: true,
      analyzedDate: '2024-03-20',
      status: 'flagged'
    },
  ]);

  const filteredAnalyses = analyses.filter(analysis =>
    analysis.skillName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    analysis.skillOwner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalAnalyzed: analyses.length,
    avgConfidence: (analyses.reduce((sum, a) => sum + a.aiConfidence, 0) / analyses.length).toFixed(1),
    flaggedSkills: analyses.filter(a => a.flagged).length,
    accuracyRate: 96.8
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">AI Analyzer Monitoring</h1>
          <p className="text-gray-600 mt-2">Monitor AI skill analysis and accuracy metrics</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">Total Analyzed</p>
          <p className="text-2xl font-bold text-blue-600">{stats.totalAnalyzed}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">Avg Confidence</p>
          <p className="text-2xl font-bold text-green-600">{stats.avgConfidence}%</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">Flagged Skills</p>
          <p className="text-2xl font-bold text-red-600">{stats.flaggedSkills}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-600">Accuracy Rate</p>
          <p className="text-2xl font-bold text-purple-600">{stats.accuracyRate}%</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1 flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg">
            <Search size={20} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search analyzed skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent outline-none text-gray-700"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* Analysis Results Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Skill Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Owner</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Confidence</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Suggested Category</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Analyzed Date</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAnalyses.map((analysis) => (
              <tr key={analysis.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-800">{analysis.skillName}</p>
                    <p className="text-xs text-gray-500 truncate">{analysis.description}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{analysis.skillOwner}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden w-16">
                      <div
                        className={`h-full ${
                          analysis.aiConfidence >= 80 ? 'bg-green-500' :
                          analysis.aiConfidence >= 60 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${analysis.aiConfidence}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{analysis.aiConfidence}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{analysis.suggestedCategory}</td>
                <td className="px-6 py-4">
                  {analysis.flagged ? (
                    <span className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold flex items-center gap-1">
                      <AlertCircle size={14} />
                      Flagged
                    </span>
                  ) : (
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold flex items-center gap-1">
                      <CheckCircle size={14} />
                      Approved
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{analysis.analyzedDate}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 text-sm" title="View Details">
                      View
                    </button>
                    {analysis.flagged && (
                      <button className="p-2 hover:bg-green-100 rounded-lg text-green-600 text-sm" title="Approve">
                        Approve
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* AI Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Brain size={24} className="text-purple-600" />
            AI Performance Metrics
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Accuracy Rate</span>
              <span className="font-bold text-green-600">96.8%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">False Positives</span>
              <span className="font-bold text-orange-600">2.1%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">False Negatives</span>
              <span className="font-bold text-orange-600">1.1%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Avg Processing Time</span>
              <span className="font-bold text-blue-600">2.3s</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Category Distribution</h3>
          <div className="space-y-2">
            {[
              { name: 'Web Development', count: 45, color: 'bg-blue-500' },
              { name: 'Design', count: 32, color: 'bg-purple-500' },
              { name: 'Backend', count: 28, color: 'bg-green-500' },
              { name: 'Mobile', count: 15, color: 'bg-orange-500' },
              { name: 'Data Science', count: 10, color: 'bg-red-500' },
            ].map((cat, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{cat.name}</span>
                  <span className="font-bold text-gray-800">{cat.count}</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={cat.color}
                    style={{ width: `${(cat.count / 50) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
