import React, { useState } from 'react';
import { ChevronDown, Download, TrendingDown, TrendingUp } from 'lucide-react';

const Analytics: React.FC = () => {
  const [timeRange] = useState('Last 30 Days');
  
  // Sample data
  const overviewStats = [
    { title: 'Total Impressions', value: '1.2M', change: { value: 12, isPositive: true } },
    { title: 'Engagement Rate', value: '4.8%', change: { value: 0.5, isPositive: true } },
    { title: 'Link Clicks', value: '24.5K', change: { value: 8, isPositive: true } },
    { title: 'Conversion Rate', value: '2.1%', change: { value: 0.3, isPositive: false } },
  ];
  
  const platformPerformance = [
    { platform: 'Instagram', impressions: 482000, engagement: 5.2, clicks: 8900, followers: 24500, change: 12 },
    { platform: 'Twitter', impressions: 356000, engagement: 4.1, clicks: 6200, followers: 18700, change: 8 },
    { platform: 'Facebook', impressions: 215000, engagement: 3.8, clicks: 5400, followers: 15200, change: -2 },
    { platform: 'LinkedIn', impressions: 124000, engagement: 6.2, clicks: 3800, followers: 9600, change: 15 },
    { platform: 'TikTok', impressions: 98000, engagement: 7.5, clicks: 2600, followers: 7800, change: 24 },
  ];


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-xl font-medium">Performance Overview</h2>
        
        <div className="flex gap-3">
          <div className="relative">
            <button className="btn btn-secondary text-sm flex items-center">
              <span>{timeRange}</span>
              <ChevronDown size={14} className="ml-1" />
            </button>
            
            {/* Time range dropdown would be implemented here */}
          </div>
          
          <button className="btn btn-secondary text-sm flex items-center">
            <Download size={16} className="mr-1.5" />
            <span>Export</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {overviewStats.map((stat, index) => (
          <div key={index} className="card">
            <h3 className="text-sm text-gray-500 mb-1">{stat.title}</h3>
            <div className="flex items-baseline">
              <span className="text-2xl font-semibold mr-2">{stat.value}</span>
              <div className={`flex items-center text-xs ${
                stat.change.isPositive ? 'text-green-500' : 'text-red-500'
              }`}>
                {stat.change.isPositive ? (
                  <TrendingUp size={14} className="mr-0.5" />
                ) : (
                  <TrendingDown size={14} className="mr-0.5" />
                )}
                <span>{stat.change.value}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium">Platform Performance</h2>
          <div className="flex gap-2">
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-blue-500 mr-1.5"></span>
              <span className="text-xs text-gray-500">Impressions</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-green-500 mr-1.5"></span>
              <span className="text-xs text-gray-500">Engagement</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-purple-500 mr-1.5"></span>
              <span className="text-xs text-gray-500">Clicks</span>
            </div>
          </div>
        </div>
        
        {/* Chart would be implemented here */}
        <div className="h-64 bg-gray-50 rounded-xl flex items-center justify-center">
          <p className="text-gray-500">Platform performance chart would render here</p>
        </div>
        
        <div className="mt-6 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impressions</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Engagement</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Followers</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {platformPerformance.map((platform, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{platform.platform}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                    {(platform.impressions / 1000).toFixed(1)}K
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                    {platform.engagement}%
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                    {(platform.clicks / 1000).toFixed(1)}K
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                    {(platform.followers / 1000).toFixed(1)}K
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className={`flex items-center ${
                      platform.change >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {platform.change >= 0 ? (
                        <TrendingUp size={16} className="mr-1" />
                      ) : (
                        <TrendingDown size={16} className="mr-1" />
                      )}
                      <span className="text-xs font-medium">{platform.change}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium mb-4">Audience Demographics</h3>
          <div className="h-64 bg-gray-50 rounded-xl flex items-center justify-center">
            <p className="text-gray-500">Demographics chart would render here</p>
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-medium mb-4">Content Performance</h3>
          <div className="h-64 bg-gray-50 rounded-xl flex items-center justify-center">
            <p className="text-gray-500">Content performance chart would render here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;