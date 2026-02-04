import React, { useState } from 'react';
import { AlertTriangle, Ban, Flag, History, Shield } from 'lucide-react';

interface FlaggedWarrior {
  id: number;
  name: string;
  avatar?: string;
  reason: 'fake_proof' | 'missed_deadlines' | 'inactivity' | 'low_quality' | 'multiple_rejections';
  warningCount: number;
  lastActionDate: Date;
  lastActionBy: string;
  status: 'pending_review' | 'under_investigation' | 'suspended';
}

interface FlaggedWarriorsProps {
  warriors: FlaggedWarrior[];
  onViewHistory: (warriorId: number) => void;
  onClearFlag: (warriorId: number) => void;
  onSuspend: (warriorId: number) => void;
}

const FlaggedWarriors: React.FC<FlaggedWarriorsProps> = ({
  warriors,
  onViewHistory,
  onClearFlag,
  onSuspend,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>('all');

  const reasonLabels = {
    fake_proof: 'Fake Proof Submission',
    missed_deadlines: 'Missed Deadlines',
    inactivity: 'Extended Inactivity',
    low_quality: 'Low Quality Work',
    multiple_rejections: 'Multiple Rejections',
  };

  const getStatusColor = (status: FlaggedWarrior['status']) => {
    switch (status) {
      case 'pending_review':
        return 'bg-yellow-100 text-yellow-700';
      case 'under_investigation':
        return 'bg-orange-100 text-orange-700';
      case 'suspended':
        return 'bg-red-100 text-red-700';
    }
  };

  const filteredWarriors = selectedReason === 'all'
    ? warriors
    : warriors.filter(w => w.reason === selectedReason);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flag size={20} className="text-red-500" />
          <h2 className="text-lg font-medium">Flagged Warriors</h2>
          <span className="bg-red-100 text-red-700 text-sm px-2 py-0.5 rounded-full">
            {warriors.length}
          </span>
        </div>

        <div className="flex gap-2">
          <select
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
            className="input text-sm py-1.5"
          >
            <option value="all">All Issues</option>
            {Object.entries(reasonLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Warrior
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reason
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Warnings
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Action
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredWarriors.map((warrior) => (
              <tr key={warrior.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden mr-3">
                      {warrior.avatar ? (
                        <img src={warrior.avatar} alt={warrior.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-red-100 text-red-500 text-xs font-medium">
                          {warrior.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 flex items-center">
                        {warrior.name}
                        <AlertTriangle size={14} className="text-red-500 ml-1.5" />
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {reasonLabels[warrior.reason]}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {warrior.warningCount} Warnings
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm text-gray-900">
                      {warrior.lastActionDate.toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      by {warrior.lastActionBy}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(warrior.status)}`}>
                    {warrior.status.split('_').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onViewHistory(warrior.id)}
                      className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      title="View History"
                    >
                      <History size={16} />
                    </button>
                    <button
                      onClick={() => onClearFlag(warrior.id)}
                      className="p-1.5 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                      title="Clear Flag"
                    >
                      <Shield size={16} />
                    </button>
                    <button
                      onClick={() => onSuspend(warrior.id)}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Suspend Warrior"
                    >
                      <Ban size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredWarriors.length === 0 && (
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <Flag size={24} className="text-gray-400" />
          </div>
          <h3 className="text-gray-500 font-medium">No flagged warriors found</h3>
          <p className="text-gray-400 text-sm mt-1">
            All warriors are currently in good standing
          </p>
        </div>
      )}
    </div>
  );
};

export default FlaggedWarriors;