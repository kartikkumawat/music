import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore';
import { useMusic } from '../contexts/MusicContext';
import SearchBar from '../components/music/SearchBar';
import SongCard from '../components/music/SongCard';
import { TrendingUp, Clock, Star } from 'lucide-react';

const Home = () => {
  const [featuredSongs, setFeaturedSongs] = useState([]);
  const [recentSongs, setRecentSongs] = useState([]);
  const [popularSongs, setPopularSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const { playSong } = useMusic();

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      // Fetch recent songs
      const recentQuery = query(
        collection(db, 'songs'),
        orderBy('createdAt', 'desc'),
        limit(12)
      );
      const recentSnapshot = await getDocs(recentQuery);
      const recent = recentSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Fetch popular songs
      const popularQuery = query(
        collection(db, 'songs'),
        orderBy('playCount', 'desc'),
        limit(12)
      );
      const popularSnapshot = await getDocs(popularQuery);
      const popular = popularSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setRecentSongs(recent);
      setPopularSongs(popular);
      setFeaturedSongs(recent.slice(0, 6)); // Use recent as featured
      setLoading(false);
    } catch (error) {
      console.error('Error fetching home data:', error);
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
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
  };

  const SongGrid = ({ title, songs, icon: Icon, showAll = false }) => (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icon size={24} className="text-primary-500" />
          <h2 className="text-2xl font-bold text-white">{title}</h2>
        </div>
        {showAll && (
          <button className="text-primary-500 hover:text-primary-400 transition-colors">
            Show All
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {songs.map((song) => (
          <SongCard
            key={song.id}
            song={song}
            onClick={() => playSong(song, songs)}
          />
        ))}
      </div>
    </section>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin-slow w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      {/* Search Section */}
      <div className="mb-8">
        <SearchBar onSearch={handleSearch} />
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <SongGrid
          title="Search Results"
          songs={searchResults}
          icon={TrendingUp}
        />
      )}

      {/* Featured Songs */}
      {featuredSongs.length > 0 && (
        <SongGrid
          title="Featured Tracks"
          songs={featuredSongs}
          icon={Star}
          showAll
        />
      )}

      {/* Recent Songs */}
      {recentSongs.length > 0 && (
        <SongGrid
          title="Recently Added"
          songs={recentSongs}
          icon={Clock}
          showAll
        />
      )}

      {/* Popular Songs */}
      {popularSongs.length > 0 && (
        <SongGrid
          title="Trending Now"
          songs={popularSongs}
          icon={TrendingUp}
          showAll
        />
      )}
    </div>
  );
};

export default Home;