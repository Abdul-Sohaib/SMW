import React, { useState } from 'react';
import { ChevronDown, Medal, Search, SlidersHorizontal, Trophy, TrendingUp } from 'lucide-react';

const Leaderboard: React.FC = () => {
  const [timeRange] = useState('This Week');
  
  // Sample data
  const warriors = [
    { id: 1, rank: 1, name: 'Sarah Johnson', avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150', tasksCompleted: 42, engagement: 95, conversions: 28, totalPoints: 4250 },
    { id: 2, rank: 2, name: 'Michael Chen', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150', tasksCompleted: 38, engagement: 92, conversions: 24, totalPoints: 3980 },
    { id: 3, rank: 3, name: 'Emily Williams', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150', tasksCompleted: 36, engagement: 88, conversions: 26, totalPoints: 3760 },
    { id: 4, rank: 4, name: 'Jessica Martinez', avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150', tasksCompleted: 34, engagement: 90, conversions: 22, totalPoints: 3650 },
    { id: 5, rank: 5, name: 'Ryan Taylor', avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=150', tasksCompleted: 32, engagement: 85, conversions: 23, totalPoints: 3540 },
    { id: 6, rank: 6, name: 'Alex Rodriguez', avatar: '', tasksCompleted: 30, engagement: 82, conversions: 20, totalPoints: 3320 },
    { id: 7, rank: 7, name: 'David Kim', avatar: '', tasksCompleted: 28, engagement: 80, conversions: 18, totalPoints: 3150 },
    { id: 8, rank: 8, name: 'Lisa Wang', avatar: '', tasksCompleted: 26, engagement: 78, conversions: 16, totalPoints: 2980 },
  ];


  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="relative max-w-md w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search warriors..."
            className="pl-10 input"
          />
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <button className="btn btn-secondary text-sm flex items-center">
              <span>{timeRange}</span>
              <ChevronDown size={14} className="ml-1" />
            </button>
            
            {/* Time range dropdown would be implemented here */}
          </div>
          
          <button className="btn btn-secondary text-sm flex items-center">
            <SlidersHorizontal size={16} className="mr-1.5" />
            <span>Metrics</span>
            <ChevronDown size={14} className="ml-1" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="card bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-xl bg-yellow-500 text-white flex items-center justify-center mr-4">
              <Trophy size={24} />
            </div>
            <div>
              <h3 className="text-lg font-medium text-yellow-800">{warriors[0].name}</h3>
              <p className="text-sm text-yellow-700">Top Performer of the Week</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-yellow-700">Total Points</span>
              <span className="font-medium text-yellow-900">{warriors[0].totalPoints}</span>
            </div>
            <div className="w-full bg-yellow-200 rounded-full h-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>
        
        <div className="card bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-xl bg-gray-500 text-white flex items-center justify-center mr-4">
              <Medal size={24} />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-800">{warriors[1].name}</h3>
              <p className="text-sm text-gray-700">Second Place</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700">Total Points</span>
              <span className="font-medium text-gray-900">{warriors[1].totalPoints}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gray-500 h-2 rounded-full" style={{ width: `${(warriors[1].totalPoints / warriors[0].totalPoints) * 100}%` }}></div>
            </div>
          </div>
        </div>
        
        <div className="card bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-xl bg-orange-500 text-white flex items-center justify-center mr-4">
              <Medal size={24} />
            </div>
            <div>
              <h3 className="text-lg font-medium text-orange-800">{warriors[2].name}</h3>
              <p className="text-sm text-orange-700">Third Place</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-orange-700">Total Points</span>
              <span className="font-medium text-orange-900">{warriors[2].totalPoints}</span>
            </div>
            <div className="w-full bg-orange-200 rounded-full h-2">
              <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${(warriors[2].totalPoints / warriors[0].totalPoints) * 100}%` }}></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium">Leaderboard Rankings</h2>
          <button className="text-sm text-blue-500 font-medium hover:text-blue-600 transition-colors">
            Export Results
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warrior</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tasks</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Engagement</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversions</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Points</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {warriors.map((warrior) => (
                <tr key={warrior.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                      warrior.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                      warrior.rank === 2 ? 'bg-gray-100 text-gray-700' :
                      warrior.rank === 3 ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-50 text-blue-700'
                    }`}>
                      {warrior.rank}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden mr-3">
                        {warrior.avatar ? (
                          <img src={warrior.avatar} alt={warrior.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-500 text-xs font-medium">
                            {warrior.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{warrior.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{warrior.tasksCompleted}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{warrior.engagement}%</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{warrior.conversions}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{warrior.totalPoints}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center text-green-500">
                      <TrendingUp size={16} className="mr-1" />
                      <span className="text-xs font-medium">+12%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;