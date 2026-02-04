/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import {
  Award,
  Ban,
  Check,
  ChevronDown,
  Clock,
  Star,
  User,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { getSmwPerformance } from '../api';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface SocialProfile {
  platform: string;
  username: string;
  followers: number;
  verified: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface TaskProof {
  id: number;
  taskTitle: string;
  platform: string;
  timestamp: Date;
  status: 'approved' | 'pending' | 'rejected';
  imageUrl?: string;
  link: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Warning {
  id: number;
  date: Date;
  reason: string;
  status: 'active' | 'resolved';
}

interface SmwAccount {  // Moved this here since it seems more relevant to the profile
  id: number;
  reward_points: number;
  user_id: number | null;
  instagram_link: string | null;
  facebook_link: string | null;
  twitter_link: string | null;
  createdAt: string;
  updatedAt: string;
  user_details: {
      id: number;
      role: string;
      name: string;
      phoneNumber: string;
      is_verified: boolean;
      booth_id: number;
      village_id: number | null;
      createdAt: string;
      updatedAt: string;
  } | null;
}

interface SmwPerformanceResult {
  smw: any[]; // Adjust the type of 'smw' based on the actual data structure
  count: {
    pendingTask: number;
    reviewedTask: number;
    rejectedTask: number;
  };
}

interface WarriorProfileProps {
    warrior: SmwAccount;
    onClose: () => void;
}

const WarriorProfile: React.FC<WarriorProfileProps> = ({ warrior, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showActions, setShowActions] = useState(false);
  const [performanceData, setPerformanceData] = useState<SmwPerformanceResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useAppContext();

  useEffect(() => {
      const fetchPerformanceData = async () => {
          try {

              const data = await getSmwPerformance(warrior.id);

        if (data.success) {
          setPerformanceData(data.result);
        } else {
          setError(data.message || 'Failed to fetch performance data.');
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceData();
  }, [warrior.id]); // Dependency array includes warrior.id

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'history', label: 'Task History' },
    { id: 'warnings', label: `Warnings (0)` }, // Assuming you don't have warnings data in the SmwAccount
  ];

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {loading && <p>Loading performance data...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {performanceData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card bg-green-50 border border-green-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-green-700">Reviewed Tasks</span>
                <Check size={16} className="text-green-500" />
              </div>
              <div className="text-2xl font-semibold text-green-700">{performanceData.count.reviewedTask}</div>
            </div>

            <div className="card bg-yellow-50 border border-yellow-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-yellow-700">Pending Review</span>
                <Clock size={16} className="text-yellow-500" />
              </div>
              <div className="text-2xl font-semibold text-yellow-700">{performanceData.count.pendingTask}</div>
            </div>

            <div className="card bg-red-50 border border-red-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-red-700">Rejected Tasks</span>
                <Ban size={16} className="text-red-500" />
              </div>
              <div className="text-2xl font-semibold text-red-700">{performanceData.count.rejectedTask}</div>
            </div>
          </div>

          {/* Add other performance data display here as needed */}
          {/* <div className="card">
            <h3 className="text-lg font-medium mb-4">SMW Data</h3>
            <pre>{JSON.stringify(performanceData.smw, null, 2)}</pre>
          </div> */}

        </>
      )}
    </div>
  );

  const renderHistoryTab = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-medium mb-4">Recent Task Proofs</h3>
        <div> No Task Proofs available.</div>
      </div>
    </div>
  );

  const renderWarningsTab = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-medium mb-4">Warning History</h3>
        <div> No Warnings available.</div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center overflow-y-auto py-8 z-50">
      <div className="bg-white rounded-2xl w-full max-w-4xl mx-4 relative">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex-shrink-0 overflow-hidden">
                {warrior.user_details?.name ? (
                  <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-500 font-medium">
                  {warrior.user_details?.name.substring(0, 2).toUpperCase()}
              </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-500">
                    <User size={32} />
                  </div>
                )}
              </div>
              <div className="ml-4">
                <h2 className="text-2xl font-medium">{warrior.user_details?.name}</h2>
                <div className="flex items-center mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    warrior.user_details?.is_verified 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {warrior.user_details?.is_verified ? 'Verified' : 'Unverified'}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">{warrior.user_details?.role}</span>
                  <span className="text-sm text-gray-400 ml-2">•</span>
                  <span className="text-sm text-gray-500 ml-2">
                    Joined {new Date(warrior.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="btn btn-secondary text-sm flex items-center"
                >
                  Actions
                  <ChevronDown size={14} className="ml-1" />
                </button>

                {showActions && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-1 z-20 border border-gray-100">
                    <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <Award size={16} className="mr-2" />
                      View Analytics
                    </button>
                    <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <Star size={16} className="mr-2" />
                      Promote Warrior
                    </button>
                    <button className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                      <Ban size={16} className="mr-2" />
                      Suspend Account
                    </button>
                  </div>
                )}
              </div>

              <button onClick={onClose} className="btn btn-secondary text-sm">
                Close
              </button>
            </div>
          </div>

          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'history' && renderHistoryTab()}
          {activeTab === 'warnings' && renderWarningsTab()}
        </div>
      </div>
    </div>
  );
};

export default WarriorProfile;