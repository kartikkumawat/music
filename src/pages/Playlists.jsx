import React, { useState } from 'react';
import { usePlaylist } from '../contexts/PlaylistContext';
import { useAuth } from '../contexts/AuthContext';
import PlaylistCard from '../components/playlist/PlaylistCard';
import PlaylistCreator from '../components/playlist/PlaylistCreator';
import { Plus, List, Music, Heart } from 'lucide-react';

const Playlists = () => {
  const [showCreator, setShowCreator] = useState(false);
  const { playlists, loading } = usePlaylist();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Music size={64} className="mx-auto text-gray-600 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Sign in to view playlists</h2>
          <p className="text-gray-400">Create and manage your personal playlists</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin-slow w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Your Playlists</h1>
          <p className="text-gray-400">Organize your favorite music</p>
        </div>
        <button
          onClick={() => setShowCreator(true)}
          className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          <Plus size={20} />
          <span>Create Playlist</span>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-dark-100 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Playlists</p>
              <p className="text-2xl font-bold text-white">{playlists.length}</p>
            </div>
            <List size={32} className="text-primary-500" />
          </div>
        </div>
        
        <div className="bg-dark-100 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Songs</p>
              <p className="text-2xl font-bold text-white">
                {playlists.reduce((total, playlist) => total + (playlist.songs?.length || 0), 0)}
              </p>
            </div>
            <Music size={32} className="text-green-500" />
          </div>
        </div>
        
        <div className="bg-dark-100 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Favorites</p>
              <p className="text-2xl font-bold text-white">
                {playlists.filter(p => p.name.toLowerCase().includes('favorite')).length}
              </p>
            </div>
            <Heart size={32} className="text-red-500" />
          </div>
        </div>
      </div>

      {/* Playlists Grid */}
      {playlists.length > 0 ? (
        <div>
          <div className="flex items-center space-x-2 mb-6">
            <List size={24} className="text-primary-500" />
            <h2 className="text-2xl font-bold text-white">Your Collections</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {playlists.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <List size={64} className="mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No playlists yet</h3>
          <p className="text-gray-400 mb-6">Create your first playlist to get started</p>
          <button
            onClick={() => setShowCreator(true)}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Create Your First Playlist
          </button>
        </div>
      )}

      {/* Playlist Creator Modal */}
      {showCreator && (
        <PlaylistCreator
          onClose={() => setShowCreator(false)}
          onSuccess={() => {
            setShowCreator(false);
          }}
        />
      )}
    </div>
  );
};

export default Playlists;