import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminDashboard from '../components/admin/AdminDashboard';
import SongUpload from '../components/admin/SongUpload';
import SongManager from '../components/admin/SongManager';
import {
  BarChart3,
  Upload,
  Music,
  Settings,
  Home,
  Database
} from 'lucide-react';

const AdminPanel = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!isAdmin) {
    return <div>Access Denied</div>;
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, component: AdminDashboard },
    { id: 'upload', label: 'Upload Music', icon: Upload, component: SongUpload },
    { id: 'manage', label: 'Manage Songs', icon: Database, component: SongManager },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || AdminDashboard;

  return (
    <div className="min-h-screen bg-dark-300">
      {/* Admin Navigation */}
      <div className="bg-dark-200 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Admin Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                <Settings size={20} className="text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">Admin Panel</h1>
            </div>

            {/* Public Site Link */}
            <a
              href="/"
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
            >
              <Home size={18} />
              <span>View Site</span>
            </a>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 pb-4">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto">
        <ActiveComponent />
      </div>
    </div>
  );
};

export default AdminPanel;
