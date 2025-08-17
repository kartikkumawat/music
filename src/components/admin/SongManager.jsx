import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Search, Edit, Trash2, Play, Pause, Music, Filter } from 'lucide-react';

const SongManager = () => {
  const [songs, setSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [editingSong, setEditingSong] = useState(null);
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    fetchSongs();
  }, []);

  useEffect(() => {
    filterSongs();
  }, [songs, searchQuery, selectedGenre]);

  const fetchSongs = async () => {
    try {
      const songsSnapshot = await getDocs(collection(db, 'songs'));
      const songsData = songsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setSongs(songsData);
      
      // Extract unique genres
      const uniqueGenres = [...new Set(songsData.map(song => song.genre).filter(Boolean))];
      setGenres(uniqueGenres);
    } catch (error) {
      console.error('Error fetching songs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSongs = () => {
    let filtered = songs;

    if (searchQuery) {
      filtered = filtered.filter(song =>
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.album?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedGenre) {
      filtered = filtered.filter(song => song.genre === selectedGenre);
    }

    setFilteredSongs(filtered);
  };

  const handleDeleteSong = async (songId, songTitle) => {
    if (window.confirm(`Are you sure you want to delete "${songTitle}"?`)) {
      try {
        await deleteDoc(doc(db, 'songs', songId));
        setSongs(songs.filter(song => song.id !== songId));
        alert('Song deleted successfully');
      } catch (error) {
        console.error('Error deleting song:', error);
        alert('Failed to delete song');
      }
    }
  };

  const handleEditSong = async (songId, updatedData) => {
    try {
      const songRef = doc(db, 'songs', songId);
      await updateDoc(songRef, updatedData);
      
      setSongs(songs.map(song => 
        song.id === songId 
          ? { ...song, ...updatedData }
          : song
      ));
      
      setEditingSong(null);
      alert('Song updated successfully');
    } catch (error) {
      console.error('Error updating song:', error);
      alert('Failed to update song');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
  };

  const formatDuration = (duration) => {
    if (!duration) return 'Unknown';
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="bg-dark-100 rounded-lg p-6">
        <div className="animate-spin-slow w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="bg-dark-100 rounded-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-4">Song Management</h2>
        
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search songs, artists, albums..."
              className="w-full pl-10 pr-4 py-2 bg-dark-200 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="bg-dark-200 border border-gray-600 rounded-lg text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Genres</option>
              {genres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-4 text-gray-400">
          Showing {filteredSongs.length} of {songs.length} songs
        </div>
      </div>

      {/* Songs Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-dark-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Song
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Artist
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Album
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Genre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Plays
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Added
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredSongs.map((song) => (
              <tr key={song.id} className="hover:bg-dark-200 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img
                      src={song.imageUrl || '/default-album.jpg'}
                      alt={song.title}
                      className="w-10 h-10 rounded object-cover mr-3"
                    />
                    <div>
                      <div className="text-white font-medium">{song.title}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                  {song.artist}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                  {song.album || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs bg-primary-500/20 text-primary-300 rounded-full">
                    {song.genre || 'Unknown'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                  {formatDuration(song.duration)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                  {song.playCount || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                  {formatDate(song.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditingSong(song)}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteSong(song.id, song.title)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredSongs.length === 0 && (
        <div className="text-center py-12">
          <Music size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">No songs found</p>
        </div>
      )}

      {/* Edit Modal */}
      {editingSong && (
        <EditSongModal
          song={editingSong}
          onSave={handleEditSong}
          onClose={() => setEditingSong(null)}
        />
      )}
    </div>
  );
};

// Edit Song Modal Component
const EditSongModal = ({ song, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: song.title || '',
    artist: song.artist || '',
    album: song.album || '',
    genre: song.genre || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(song.id, formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-100 rounded-lg shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-xl font-bold text-white">Edit Song</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 bg-dark-200 border border-gray-600 rounded text-white focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Artist
            </label>
            <input
              type="text"
              value={formData.artist}
              onChange={(e) => setFormData({...formData, artist: e.target.value})}
              className="w-full px-3 py-2 bg-dark-200 border border-gray-600 rounded text-white focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Album
            </label>
            <input
              type="text"
              value={formData.album}
              onChange={(e) => setFormData({...formData, album: e.target.value})}
              className="w-full px-3 py-2 bg-dark-200 border border-gray-600 rounded text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Genre
            </label>
            <input
              type="text"
              value={formData.genre}
              onChange={(e) => setFormData({...formData, genre: e.target.value})}
              className="w-full px-3 py-2 bg-dark-200 border border-gray-600 rounded text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-600 text-gray-300 rounded hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-primary-500 hover:bg-primary-600 text-white rounded transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SongManager;