import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../services/firebase';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';

const PlaylistContext = createContext();

export const usePlaylist = () => {
  const context = useContext(PlaylistContext);
  if (!context) {
    throw new Error('usePlaylist must be used within PlaylistProvider');
  }
  return context;
};

export const PlaylistProvider = ({ children }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch all playlists
  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'playlists'));
      const playlistsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPlaylists(playlistsData);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create new playlist
  const createPlaylist = async (playlistData) => {
    try {
      const docRef = await addDoc(collection(db, 'playlists'), {
        ...playlistData,
        songs: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      const newPlaylist = {
        id: docRef.id,
        ...playlistData,
        songs: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setPlaylists(prev => [newPlaylist, ...prev]);
      return newPlaylist;
    } catch (error) {
      console.error('Error creating playlist:', error);
      throw error;
    }
  };

  // Update playlist
  const updatePlaylist = async (playlistId, playlistData) => {
    try {
      const playlistRef = doc(db, 'playlists', playlistId);
      await updateDoc(playlistRef, {
        ...playlistData,
        updatedAt: serverTimestamp()
      });

      setPlaylists(prev => prev.map(p =>
        p.id === playlistId
          ? { ...p, ...playlistData, updatedAt: new Date() }
          : p
      ));

      return true;
    } catch (error) {
      console.error('Error updating playlist:', error);
      throw error;
    }
  };

  // Add song to playlist
  const addSongToPlaylist = async (playlistId, songId) => {
    try {
      const playlistRef = doc(db, 'playlists', playlistId);
      const playlist = playlists.find(p => p.id === playlistId);

      if (!playlist) throw new Error('Playlist not found');

      // Check if song is already in playlist
      if (playlist.songs.includes(songId)) {
        throw new Error('Song already in playlist');
      }

      const updatedSongs = [...playlist.songs, songId];
      await updateDoc(playlistRef, {
        songs: updatedSongs,
        updatedAt: serverTimestamp()
      });

      setPlaylists(prev => prev.map(p =>
        p.id === playlistId
          ? { ...p, songs: updatedSongs, updatedAt: new Date() }
          : p
      ));

      return true;
    } catch (error) {
      console.error('Error adding song to playlist:', error);
      throw error;
    }
  };

  // Remove song from playlist
  const removeSongFromPlaylist = async (playlistId, songId) => {
    try {
      const playlistRef = doc(db, 'playlists', playlistId);
      const playlist = playlists.find(p => p.id === playlistId);

      if (!playlist) throw new Error('Playlist not found');

      const updatedSongs = playlist.songs.filter(id => id !== songId);
      await updateDoc(playlistRef, {
        songs: updatedSongs,
        updatedAt: serverTimestamp()
      });

      setPlaylists(prev => prev.map(p =>
        p.id === playlistId
          ? { ...p, songs: updatedSongs, updatedAt: new Date() }
          : p
      ));

      return true;
    } catch (error) {
      console.error('Error removing song from playlist:', error);
      throw error;
    }
  };

  // Delete playlist
  const deletePlaylist = async (playlistId) => {
    try {
      await deleteDoc(doc(db, 'playlists', playlistId));
      setPlaylists(prev => prev.filter(p => p.id !== playlistId));
      return true;
    } catch (error) {
      console.error('Error deleting playlist:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const value = {
    playlists,
    loading,
    showCreateModal,
    setShowCreateModal,
    createPlaylist,
    updatePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    deletePlaylist,
    fetchPlaylists
  };

  return (
    <PlaylistContext.Provider value={value}>
      {children}
    </PlaylistContext.Provider>
  );
};

export default PlaylistContext;
