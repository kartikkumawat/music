import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { songsAPI } from '../../services/api';
import {
  Music,
  Upload,
  BarChart3,
  Users,
  Settings,
  LogOut,
  TrendingUp,
  Clock,
  PlayCircle,
  Database
} from 'lucide-react';
import { formatPlayCount, getTimeAgo } from '../../utils/helpers';

const AdminDashboard = () => {
  const { logout } = useAuth();
  const [stats, setStats] = useState({
    totalSongs: 0,
    totalPlays: 0,
    totalUsers: 0,
    recentUploads: 0
  });
  const [recentSongs, setRecentSongs] = useState([]);
  const [topSongs, setTopSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all songs
      const allSongs = await songsAPI.getAll();

      // Fetch recent songs
      const recent = await songsAPI.getRecent(5);

      // Fetch popular songs
      const popular = await songsAPI.getPopular(5);

      // Calculate stats
      const totalPlays = allSongs.reduce((sum, song) => sum + (song.playCount || 0), 0);
      const recentUploads = allSongs.filter(song => {
        const uploadDate = song.createdAt?.toDate();
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return uploadDate && uploadDate > weekAgo;
      }).length;

      setStats({
        totalSongs: allSongs.length,
        totalPlays,
        totalUsers: 150, // Mock data - you can implement user tracking
        recentUploads
      });

      setRecentSongs(recent);
      setTopSongs(popular);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, change }) => (
    <div className="bg-dark-100 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
        {change && (
          <div className="flex items-center text-green-400 text-sm">
            <TrendingUp size={16} className="mr-1" />
            {change}
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
      <p className="text-gray-400 text-sm">{title}</p>
    </div>
  );

  const SongRow = ({ song, showPlays = false }) => (
    <div className="flex items-center space-x-3 p-3 hover:bg-dark-200 rounded-lg transition-colors">
      {song.imageUrl ? (
        <img
          src={song.imageUrl}
          alt={song.title}
          className="w-12 h-12 rounded-md object-cover"
        />
      ) : (
        <div className="w-12 h-12 bg-gray-700 rounded-md flex items-center justify-center">
          <Music className="w-6 h-6 text-gray-400" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium truncate">{song.title}</p>
        <p className="text-gray-400 text-sm truncate">{song.artist}</p>
      </div>
      <div className="text-right">
        {showPlays ? (
          <p className="text-white font-medium">{formatPlayCount(song.playCount || 0)}</p>
        ) : (
          <p className="text-gray-400 text-sm">
            {song.createdAt ? getTimeAgo(song.createdAt.toDate()) : 'Unknown'}
          </p>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-300 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin-slow w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-300">
      {/* Header */}
      <div className="bg-dark-200 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
              <Settings size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-gray-400 text-sm">Music Stream Management</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Songs"
            value={stats.totalSongs.toLocaleString()}
            icon={Music}
            color="bg-blue-500"
            change="+12%"
          />
          <StatCard
            title="Total Plays"
            value={formatPlayCount(stats.totalPlays)}
            icon={PlayCircle}
            color="bg-green-500"
            change="+8%"
          />
          <StatCard
            title="Active Users"
            value={stats.totalUsers.toLocaleString()}
            icon={Users}
            color="bg-purple-500"
            change="+5%"
          />
          <StatCard
            title="Recent Uploads"
            value={stats.recentUploads.toString()}
            icon={Upload}
            color="bg-orange-500"
            change="+3"
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Songs */}
          <div className="bg-dark-100 rounded-xl border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center space-x-2">
                <Clock size={20} className="text-primary-500" />
                <h2 className="text-lg font-semibold text-white">Recent Uploads</h2>
              </div>
            </div>
            <div className="p-3">
              {recentSongs.length > 0 ? (
                recentSongs.map(song => (
                  <SongRow key={song.id} song={song} />
                ))
              ) : (
                <p className="text-gray-400 text-center py-8">No recent uploads</p>
              )}
            </div>
          </div>

          {/* Top Songs */}
          <div className="bg-dark-100 rounded-xl border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center space-x-2">
                <BarChart3 size={20} className="text-primary-500" />
                <h2 className="text-lg font-semibold text-white">Top Performing</h2>
              </div>
            </div>
            <div className="p-3">
              {topSongs.length > 0 ? (
                topSongs.map(song => (
                  <SongRow key={song.id} song={song} showPlays={true} />
                ))
              ) : (
                <p className="text-gray-400 text-center py-8">No play data available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
