import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore';
import { useMusicActions } from '../hooks/useMusicActions';
import { usePlaylist } from '../contexts/PlaylistContext';
import PlaylistCreator from '../components/playlist/PlaylistCreator';
import SearchBar from '../components/music/SearchBar';
import SongCard from '../components/music/SongCard';
import { TrendingUp, Clock, Star, ChevronRight, ArrowLeft } from 'lucide-react';
import Loading from '../components/common/Loading';

const Home = () => {
  const [featuredSongs, setFeaturedSongs] = useState([]);
  const [recentSongs, setRecentSongs] = useState([]);
  const [popularSongs, setPopularSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [showingSection, setShowingSection] = useState(null); // null, 'featured', 'recent', 'popular'

  const { playSong } = useMusicActions();
  const { showCreateModal, setShowCreateModal } = usePlaylist();

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);

      // Fetch recent songs (get more for "show all")
      const recentQuery = query(
        collection(db, 'songs'),
        orderBy('createdAt', 'desc'),
        limit(24) // Get more songs for show all
      );
      const recentSnapshot = await getDocs(recentQuery);
      const recent = recentSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Fetch popular songs (get more for "show all")
      const popularQuery = query(
        collection(db, 'songs'),
        orderBy('playCount', 'desc'),
        limit(24) // Get more songs for show all
      );
      const popularSnapshot = await getDocs(popularQuery);
      const popular = popularSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setRecentSongs(recent);
      setPopularSongs(popular);
      setFeaturedSongs(recent.slice(0, 12)); // Use recent as featured
      setLoading(false);
    } catch (error) {
      console.error('Error fetching home data:', error);
      setLoading(false);
    }
  };

  // Memoize handleSearch to prevent infinite re-renders
  const handleSearch = useCallback(async (query) => {
    if (!query) {
      setSearchResults([]);
      return;
    }

    try {
      const songsSnapshot = await getDocs(collection(db, 'songs'));
      const allSongs = songsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const filtered = allSongs.filter(song =>
        song.title.toLowerCase().includes(query.toLowerCase()) ||
        song.artist.toLowerCase().includes(query.toLowerCase()) ||
        song.album?.toLowerCase().includes(query.toLowerCase())
      );

      setSearchResults(filtered);
    } catch (error) {
      console.error('Search error:', error);
    }
  }, []);

  const handleShowAll = (section) => {
    if (showingSection === section) {
      setShowingSection(null); // Toggle off - show all sections
    } else {
      setShowingSection(section); // Show only this section
    }
  };

  const handleBackToHome = () => {
    setShowingSection(null);
    setSearchResults([]);
  };

  const handleSongClick = (song, songsArray) => {
    playSong(song, songsArray);
  };

  const SongSection = ({ title, songs, icon: Icon, sectionKey, color = "blue" }) => {
    // Don't render if we're showing a different section
    if (showingSection && showingSection !== sectionKey) {
      return null;
    }

    // Determine how many songs to show
    const isShowingAll = showingSection === sectionKey;
    const displaySongs = isShowingAll ? songs : songs.slice(0, 6);
    const hasMoreSongs = songs.length > 6;

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Icon className={`w-6 h-6 text-${color}-500`} />
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            {isShowingAll && (
              <span className="text-sm text-gray-400">({songs.length} songs)</span>
            )}
          </div>

          {hasMoreSongs && (
            <button
              onClick={() => handleShowAll(sectionKey)}
              className={`flex items-center space-x-2 text-${color}-400 hover:text-${color}-300 transition-colors text-sm font-medium`}
            >
              <span>{isShowingAll ? 'Show less' : 'Show all'}</span>
              <ChevronRight className={`w-4 h-4 transition-transform ${isShowingAll ? 'rotate-90' : ''}`} />
            </button>
          )}
        </div>

        <div className={`grid gap-4 ${
          isShowingAll
            ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'
            : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
        }`}>
          {displaySongs.map(song => (
            <SongCard
              key={song.id}
              song={song}
              onClick={(clickedSong) => handleSongClick(clickedSong, songs)}
            />
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return <Loading size="large" message="Loading your music..." />;
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          {showingSection ? (
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={handleBackToHome}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Home</span>
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-4xl font-bold text-white">
                Welcome to Your Music
              </h1>
              <p className="text-gray-400 text-lg">
                Discover millions of songs from your favorite artists
              </p>
            </>
          )}
        </div>

        {/* Search Bar - only show when not viewing a specific section */}
        {!showingSection && (
          <div className="max-w-2xl mx-auto">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search for songs, artists, albums..."
            />
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && !showingSection && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Search Results</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {searchResults.map(song => (
                <SongCard
                  key={song.id}
                  song={song}
                  onClick={(clickedSong) => handleSongClick(clickedSong, searchResults)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Music Sections */}
        {!searchResults.length && (
          <div className="space-y-12">
            {/* Featured */}
            {featuredSongs.length > 0 && (
              <SongSection
                title="Featured"
                songs={featuredSongs}
                icon={Star}
                sectionKey="featured"
                color="primary"
              />
            )}

            {/* Recently Added */}
            {recentSongs.length > 0 && (
              <SongSection
                title="Recently Added"
                songs={recentSongs}
                icon={Clock}
                sectionKey="recent"
                color="green"
              />
            )}

            {/* Popular */}
            {popularSongs.length > 0 && (
              <SongSection
                title="Popular Right Now"
                songs={popularSongs}
                icon={TrendingUp}
                sectionKey="popular"
                color="red"
              />
            )}

            {/* Empty State */}
            {featuredSongs.length === 0 && recentSongs.length === 0 && popularSongs.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-12 h-12 text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No music yet</h3>
                <p className="text-gray-400">
                  Start by uploading some songs in the admin panel
                </p>
              </div>
            )}
          </div>
        )}

        {showCreateModal && (
        <PlaylistCreator
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}
      </div>
    </div>
  );
};

export default Home;
