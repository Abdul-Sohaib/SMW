import { LucideIcon } from 'lucide-react';
import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  change?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, change }) => {
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-gray-500 text-sm mb-1">{title}</h3>
          <p className="text-2xl font-semibold">{value}</p>
          
          {change && (
            <div className="flex items-center mt-2">
              <span className={`text-xs ${change.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {change.isPositive ? '+' : ''}{change.value}%
              </span>
              <span className="text-xs text-gray-400 ml-1">vs last week</span>
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-xl bg-${color}-100 text-${color}-500`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;