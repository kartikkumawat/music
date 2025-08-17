import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import SongUpload from '../components/admin/SongUpload';
import SongManager from '../components/admin/SongManager';
import AdminDashboard from '../components/admin/AdminDashboard';
import { 
  Upload, 
  Music, 
  BarChart3, 
  Settings, 
  LogOut,
  Users,
  TrendingUp
} from 'lucide-react';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalSongs: 0,
    totalPlaylists: 0,
    totalUsers: 0,
    recentUploads: 0
  });
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch songs
      const songsSnapshot = await getDocs(collection(db, 'songs'));
      const songs = songsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Fetch playlists
      const playlistsSnapshot = await getDocs(collection(db, 'playlists'));
      
      // Calculate recent uploads (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const recentSongs = songs.filter(song => 
        song.createdAt?.toDate() > weekAgo
      );

      setStats({
        totalSongs: songs.length,
        totalPlaylists: playlistsSnapshot.docs.length,
        totalUsers: 0, // Would need user collection
        recentUploads: recentSongs.length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'upload', label: 'Upload Music', icon: Upload },
    { id: 'manage', label: 'Manage Songs', icon: Music },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard stats={stats} />;
      case 'upload':
        return <SongUpload onUploadSuccess={fetchStats} />;
      case 'manage':
        return <SongManager />;
      case 'settings':
        return (
          <div className="bg-dark-100 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>
            <div className="space-y-4">
              <div className="p-4 bg-dark-200 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">System Status</h3>
                <p className="text-green-400">All systems operational</p>
              </div>
              <div className="p-4 bg-dark-200 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Storage</h3>
                <p className="text-gray-300">Cloudinary storage connected</p>
              </div>
              <div className="p-4 bg-dark-200 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">Database</h3>
                <p className="text-gray-300">Firebase Firestore connected</p>
              </div>
            </div>
          </div>
        );
      default:
        return <AdminDashboard stats={stats} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-300 to-dark-200 flex items-center justify-center">
        <div className="animate-spin-slow w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-300 to-dark-200">
      {/* Admin Header */}
      <header className="bg-dark-200 border-b border-gray-700">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Music size={32} className="text-primary-500" />
              <div>
                <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                <p className="text-sm text-gray-400">MusicStream Management</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-dark-100 rounded-lg p-4">
              <nav className="space-y-2">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === id
                        ? 'bg-primary-500 text-white'
                        : 'text-gray-300 hover:bg-dark-200 hover:text-white'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Quick Stats Sidebar */}
            <div className="bg-dark-100 rounded-lg p-4 mt-4">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Songs</span>
                  <span className="text-white font-semibold">{stats.totalSongs}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Playlists</span>
                  <span className="text-white font-semibold">{stats.totalPlaylists}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Recent Uploads</span>
                  <span className="text-green-400 font-semibold">{stats.recentUploads}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;