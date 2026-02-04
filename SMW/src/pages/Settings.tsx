import React, { useState } from 'react';
import { Bell, Key, Lock, Mail, Phone, User, Users } from 'lucide-react';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  
  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Account', icon: Key },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'team', label: 'Team', icon: Users },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />;
      case 'account':
        return <AccountSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'team':
        return <TeamSettings />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <div>
      <h2 className="text-xl font-medium mb-6">Settings</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <nav className="flex flex-col">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`flex items-center px-4 py-3 border-l-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <tab.icon size={18} className="mr-3" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
        
        <div className="lg:col-span-3">
          <div className="card">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileSettings: React.FC = () => {
  return (
    <div>
      <h3 className="text-lg font-medium mb-6">Profile Information</h3>
      
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <div className="flex-shrink-0">
          <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 border-4 border-white shadow">
            <User size={32} />
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-medium">Profile Photo</h4>
          <p className="text-sm text-gray-500">Update your profile photo. A clear face shot helps build trust.</p>
          <div className="flex gap-2">
            <button className="btn btn-primary text-sm">Upload New</button>
            <button className="btn btn-secondary text-sm">Remove</button>
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              defaultValue="Admin"
              className="input"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              defaultValue="User"
              className="input"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail size={18} className="text-gray-400" />
            </div>
            <input
              type="email"
              defaultValue="admin@example.com"
              className="input pl-10"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone size={18} className="text-gray-400" />
            </div>
            <input
              type="tel"
              defaultValue="+1 (555) 123-4567"
              className="input pl-10"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bio
          </label>
          <textarea
            className="input min-h-[100px]"
            defaultValue="Admin user responsible for managing Social Media Warriors and overseeing campaigns."
          ></textarea>
        </div>
        
        <div className="flex justify-end gap-3">
          <button className="btn btn-secondary">Cancel</button>
          <button className="btn btn-primary">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

const AccountSettings: React.FC = () => {
  return (
    <div>
      <h3 className="text-lg font-medium mb-6">Account Settings</h3>
      
      <div className="space-y-6">
        <div>
          <h4 className="font-medium mb-1">Change Password</h4>
          <p className="text-sm text-gray-500 mb-4">Update your password regularly to keep your account secure.</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type="password"
                  className="input pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type="password"
                  className="input pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type="password"
                  className="input pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-6 border-t border-gray-100">
          <h4 className="font-medium mb-1">Two-Factor Authentication</h4>
          <p className="text-sm text-gray-500 mb-4">Add an extra layer of security to your account.</p>
          
          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-medium text-sm">Status: <span className="text-red-500">Not Enabled</span></h5>
              <p className="text-sm text-gray-500">Protect your account with 2FA.</p>
            </div>
            <button className="btn btn-primary text-sm">Enable 2FA</button>
          </div>
        </div>
        
        <div className="pt-6 border-t border-gray-100">
          <h4 className="font-medium mb-1 text-red-600">Danger Zone</h4>
          <p className="text-sm text-gray-500 mb-4">Permanently delete your account and all associated data.</p>
          
          <button className="btn bg-red-100 text-red-600 hover:bg-red-200 text-sm">Delete Account</button>
        </div>
      </div>
    </div>
  );
};

const NotificationSettings: React.FC = () => {
  return (
    <div>
      <h3 className="text-lg font-medium mb-6">Notification Preferences</h3>
      
      <div className="space-y-6">
        <div>
          <h4 className="font-medium mb-4">Email Notifications</h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div>
                <h5 className="font-medium text-sm">Task Updates</h5>
                <p className="text-xs text-gray-500">Receive updates when tasks are created or completed.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div>
                <h5 className="font-medium text-sm">Warrior Activity</h5>
                <p className="text-xs text-gray-500">Receive updates on warrior achievements and milestones.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div>
                <h5 className="font-medium text-sm">Performance Reports</h5>
                <p className="text-xs text-gray-500">Weekly and monthly performance summaries.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
          </div>
        </div>
        
        <div className="pt-6 border-t border-gray-100">
          <h4 className="font-medium mb-4">In-App Notifications</h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div>
                <h5 className="font-medium text-sm">Real-time Updates</h5>
                <p className="text-xs text-gray-500">Instant notifications for important events.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div>
                <h5 className="font-medium text-sm">System Notifications</h5>
                <p className="text-xs text-gray-500">Updates about system maintenance and changes.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <button className="btn btn-secondary">Reset to Default</button>
          <button className="btn btn-primary">Save Preferences</button>
        </div>
      </div>
    </div>
  );
};

const TeamSettings: React.FC = () => {
  return (
    <div>
      <h3 className="text-lg font-medium mb-6">Team Management</h3>
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="font-medium">Team Members</h4>
          <p className="text-sm text-gray-500">Manage access and permissions for your team.</p>
        </div>
        <button className="btn btn-primary text-sm flex items-center">
          <Users size={16} className="mr-1.5" />
          <span>Add Member</span>
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="border border-gray-100 rounded-xl p-4 hover:border-blue-100 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center flex-shrink-0 mr-3">
                <User size={18} />
              </div>
              <div>
                <h5 className="font-medium">Admin User</h5>
                <p className="text-xs text-gray-500">admin@example.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                Administrator
              </span>
              <button className="text-gray-400 hover:text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <div className="border border-gray-100 rounded-xl p-4 hover:border-blue-100 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center flex-shrink-0 mr-3">
                <User size={18} />
              </div>
              <div>
                <h5 className="font-medium">John Smith</h5>
                <p className="text-xs text-gray-500">john@example.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                Editor
              </span>
              <button className="text-gray-400 hover:text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <div className="border border-gray-100 rounded-xl p-4 hover:border-blue-100 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center flex-shrink-0 mr-3">
                <User size={18} />
              </div>
              <div>
                <h5 className="font-medium">Sarah Chen</h5>
                <p className="text-xs text-gray-500">sarah@example.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                Viewer
              </span>
              <button className="text-gray-400 hover:text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 pt-6 border-t border-gray-100">
        <h4 className="font-medium mb-4">Role Permissions</h4>
        
        <div className="space-y-4">
          <div className="border border-gray-100 rounded-xl p-4">
            <h5 className="font-medium mb-3">Administrator</h5>
            <p className="text-sm text-gray-500 mb-3">Full access to all features and settings.</p>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 inline-block text-center">Manage Warriors</span>
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 inline-block text-center">Manage Tasks</span>
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 inline-block text-center">View Analytics</span>
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 inline-block text-center">System Settings</span>
            </div>
          </div>
          
          <div className="border border-gray-100 rounded-xl p-4">
            <h5 className="font-medium mb-3">Editor</h5>
            <p className="text-sm text-gray-500 mb-3">Can manage warriors and tasks but cannot change system settings.</p>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 inline-block text-center">Manage Warriors</span>
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 inline-block text-center">Manage Tasks</span>
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 inline-block text-center">View Analytics</span>
            </div>
          </div>
          
          <div className="border border-gray-100 rounded-xl p-4">
            <h5 className="font-medium mb-3">Viewer</h5>
            <p className="text-sm text-gray-500 mb-3">Can only view data but cannot make changes.</p>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 inline-block text-center">View Warriors</span>
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 inline-block text-center">View Tasks</span>
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 inline-block text-center">View Analytics</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <button className="btn btn-primary">Edit Roles</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;