import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useMusic } from '../contexts/MusicContext';
import SearchBar from '../components/music/SearchBar';
import SongCard from '../components/music/SongCard';
import { Search as SearchIcon, TrendingUp, Music, Filter } from 'lucide-react';

const Search = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [allSongs, setAllSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [genres, setGenres] = useState([]);
  const { playSong } = useMusic();

  useEffect(() => {
    fetchAllSongs();
  }, []);

  const fetchAllSongs = async () => {
    try {
      const songsSnapshot = await getDocs(collection(db, 'songs'));
      const songs = songsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setAllSongs(songs);
      setSearchResults(songs.slice(0, 20)); // Show first 20 songs initially
      
      // Extract unique genres
      const uniqueGenres = [...new Set(songs.map(song => song.genre).filter(Boolean))];
      setGenres(uniqueGenres);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching songs:', error);
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    filterSongs(query, selectedGenre);
  };

  const handleGenreFilter = (genre) => {
    setSelectedGenre(genre);
    filterSongs(searchQuery, genre);
  };

  const filterSongs = (query, genre) => {
    let filtered = allSongs;

    if (query) {
      filtered = filtered.filter(song =>
        song.title.toLowerCase().includes(query.toLowerCase()) ||
        song.artist.toLowerCase().includes(query.toLowerCase()) ||
        song.album?.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (genre) {
      filtered = filtered.filter(song => song.genre === genre);
    }

    setSearchResults(filtered);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedGenre('');
    setSearchResults(allSongs.slice(0, 20));
  };

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
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Discover Music</h1>
        <p className="text-gray-400">Find your next favorite song</p>
      </div>

      {/* Search Section */}
      <div className="mb-8">
        <SearchBar 
          onSearch={handleSearch} 
          placeholder="Search for songs, artists, albums..."
        />
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <Filter size={20} className="text-gray-400" />
          <h3 className="text-lg font-semibold text-white">Filters</h3>
          {(searchQuery || selectedGenre) && (
            <button
              onClick={clearFilters}
              className="text-sm text-primary-500 hover:text-primary-400 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleGenreFilter('')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedGenre === ''
                ? 'bg-primary-500 text-white'
                : 'bg-dark-100 text-gray-300 hover:bg-dark-200'
            }`}
          >
            All Genres
          </button>
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => handleGenreFilter(genre)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedGenre === genre
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-100 text-gray-300 hover:bg-dark-200'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <SearchIcon size={24} className="text-primary-500" />
            <h2 className="text-2xl font-bold text-white">
              {searchQuery || selectedGenre ? 'Search Results' : 'Browse Music'}
            </h2>
            <span className="text-gray-400">({searchResults.length} songs)</span>
          </div>
        </div>
      </div>

      {/* Song Grid */}
      {searchResults.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {searchResults.map((song) => (
            <SongCard
              key={song.id}
              song={song}
              onClick={() => playSong(song, searchResults)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Music size={64} className="mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No songs found</h3>
          <p className="text-gray-400">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Popular Searches */}
      {!searchQuery && !selectedGenre && (
        <div className="mt-12">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp size={24} className="text-primary-500" />
            <h2 className="text-2xl font-bold text-white">Popular Right Now</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {allSongs
              .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
              .slice(0, 12)
              .map((song) => (
                <SongCard
                  key={song.id}
                  song={song}
                  onClick={() => playSong(song, allSongs)}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;