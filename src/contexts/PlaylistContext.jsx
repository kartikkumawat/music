import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { useAuth } from './AuthContext';

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
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchPlaylists();
    } else {
      setPlaylists([]);
      setLoading(false);
    }
  }, [user]);

  const fetchPlaylists = async () => {
    if (!user) return;
    
    try {
      const playlistsQuery = query(
        collection(db, 'playlists'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(playlistsQuery);
      const playlistsData = snapshot.docs.map(doc => ({
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

  const createPlaylist = async (name, description = '', imageUrl = '') => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const playlistData = {
        name,
        description,
        imageUrl,
        userId: user.uid,
        songs: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, 'playlists'), playlistData);
      const newPlaylist = { id: docRef.id, ...playlistData };
      
      setPlaylists(prev => [newPlaylist, ...prev]);
      return newPlaylist;
    } catch (error) {
      console.error('Error creating playlist:', error);
      throw error;
    }
  };

  const updatePlaylist = async (playlistId, updates) => {
    try {
      const playlistRef = doc(db, 'playlists', playlistId);
      const updatedData = {
        ...updates,
        updatedAt: new Date()
      };
      
      await updateDoc(playlistRef, updatedData);
      
      setPlaylists(prev => prev.map(playlist => 
        playlist.id === playlistId 
          ? { ...playlist, ...updatedData }
          : playlist
      ));
    } catch (error) {
      console.error('Error updating playlist:', error);
      throw error;
    }
  };

  const deletePlaylist = async (playlistId) => {
    try {
      await deleteDoc(doc(db, 'playlists', playlistId));
      setPlaylists(prev => prev.filter(playlist => playlist.id !== playlistId));
    } catch (error) {
      console.error('Error deleting playlist:', error);
      throw error;
    }
  };

  const addSongToPlaylist = async (playlistId, song) => {
    try {
      const playlist = playlists.find(p => p.id === playlistId);
      if (!playlist) throw new Error('Playlist not found');
      
      const updatedSongs = [...(playlist.songs || []), song];
      await updatePlaylist(playlistId, { songs: updatedSongs });
    } catch (error) {
      console.error('Error adding song to playlist:', error);
      throw error;
    }
  };

  const removeSongFromPlaylist = async (playlistId, songId) => {
    try {
      const playlist = playlists.find(p => p.id === playlistId);
      if (!playlist) throw new Error('Playlist not found');
      
      const updatedSongs = (playlist.songs || []).filter(song => song.id !== songId);
      await updatePlaylist(playlistId, { songs: updatedSongs });
    } catch (error) {
      console.error('Error removing song from playlist:', error);
      throw error;
    }
  };

  const getPlaylistById = (playlistId) => {
    return playlists.find(playlist => playlist.id === playlistId);
  };

  const value = {
    playlists,
    loading,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    getPlaylistById,
    refetchPlaylists: fetchPlaylists
  };

  return (
    <PlaylistContext.Provider value={value}>
      {children}
    </PlaylistContext.Provider>
  );
};