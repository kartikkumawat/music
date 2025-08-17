import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { Music, Users, List, TrendingUp, Calendar, Play } from 'lucide-react';

const AdminDashboard = ({ stats }) => {
  const [recentSongs, setRecentSongs] = useState([]);
  const [topSongs, setTopSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch recent songs
      const recentQuery = query(
        collection(db, 'songs'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const recentSnapshot = await getDocs(recentQuery);
      const recent = recentSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Fetch top played songs
      const topQuery = query(
        collection(db, 'songs'),
        orderBy('playCount', 'desc'),
        limit(5)
      );
      const topSnapshot = await getDocs(topQuery);
      const top = topSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setRecentSongs(recent);
      setTopSongs(top);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
  };

  const StatCard = ({ icon: Icon, title, value, change, color = 'text-primary-500' }) => (
    <div className="bg-dark-100 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {change > 0 ? '+' : ''}{change}% from last week
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-opacity-10 ${color} bg-current`}>
          <Icon size={24} className={color} />
        </div>
      </div>
    </div>
  );

  const SongRow = ({ song, showPlayCount = false }) => (
    <div className="flex items-center space-x-4 p-3 hover:bg-dark-200 rounded-lg transition-colors">
      <img
        src={song.imageUrl || '/default-album.jpg'}
        alt={song.title}
        className="w-12 h-12 rounded object-cover"
      />
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium truncate">{song.title}</p>
        <p className="text-gray-400 text-sm truncate">{song.artist}</p>
      </div>
      <div className="text-right">
        {showPlayCount ? (
          <div className="flex items-center space-x-1">
            <Play size={12} className="text-gray-400" />
            <span className="text-gray-400 text-sm">{song.playCount || 0}</span>
          </div>
        ) : (
          <span className="text-gray-400 text-sm">{formatDate(song.createdAt)}</span>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-dark-100 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-700 rounded w-5/6"></div>
            <div className="h-3 bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-white mb-2">Welcome to Admin Dashboard</h1>
        <p className="text-primary-100">Manage your music streaming platform from here.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Music}
          title="Total Songs"
          value={stats.totalSongs}
          change={5}
          color="text-primary-500"
        />
        <StatCard
          icon={List}
          title="Total Playlists"
          value={stats.totalPlaylists}
          change={12}
          color="text-green-500"
        />
        <StatCard
          icon={Users}
          title="Active Users"
          value={stats.totalUsers || 0}
          change={-2}
          color="text-blue-500"
        />
        <StatCard
          icon={TrendingUp}
          title="Recent Uploads"
          value={stats.recentUploads}
          change={8}
          color="text-orange-500"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Songs */}
        <div className="bg-dark-100 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Uploads</h3>
            <Calendar size={18} className="text-gray-400" />
          </div>
          <div className="space-y-2">
            {recentSongs.length > 0 ? (
              recentSongs.map((song) => (
                <SongRow key={song.id} song={song} />
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">No recent uploads</p>
            )}
          </div>
        </div>

        {/* Top Songs */}
        <div className="bg-dark-100 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Most Played</h3>
            <TrendingUp size={18} className="text-gray-400" />
          </div>
          <div className="space-y-2">
            {topSongs.length > 0 ? (
              topSongs.map((song, index) => (
                <div key={song.id} className="flex items-center space-x-3">
                  <span className="text-primary-500 font-bold text-lg w-6">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <SongRow song={song} showPlayCount />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">No play data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-dark-100 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white p-4 rounded-lg transition-colors">
            <Music size={20} />
            <span>Upload New Song</span>
          </button>
          <button className="flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg transition-colors">
            <TrendingUp size={20} />
            <span>View Analytics</span>
          </button>
          <button className="flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg transition-colors">
            <Users size={20} />
            <span>Manage Users</span>
          </button>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-dark-100 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Database Connection</span>
            <span className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-green-400 text-sm">Online</span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Storage Service</span>
            <span className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-green-400 text-sm">Connected</span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Audio Processing</span>
            <span className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-green-400 text-sm">Ready</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;