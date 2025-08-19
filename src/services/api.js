import { db } from './firebase';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';

// Songs API
export const songsAPI = {
  async getAll() {
    const snapshot = await getDocs(collection(db, 'songs'));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  async getById(id) {
    const docRef = doc(db, 'songs', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  },

  async create(songData) {
    const docRef = await addDoc(collection(db, 'songs'), {
      ...songData,
      createdAt: new Date(),
      playCount: 0
    });
    return docRef.id;
  },

  async update(id, updates) {
    const docRef = doc(db, 'songs', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date()
    });
  },

  async delete(id) {
    const docRef = doc(db, 'songs', id);
    await deleteDoc(docRef);
  },

  async incrementPlayCount(id) {
    const docRef = doc(db, 'songs', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const currentCount = docSnap.data().playCount || 0;
      await updateDoc(docRef, {
        playCount: currentCount + 1
      });
    }
  },

  async search(searchTerm) {
    const snapshot = await getDocs(collection(db, 'songs'));
    const allSongs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return allSongs.filter(song =>
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.album?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.genre?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  },

  async getByGenre(genre) {
    const q = query(
      collection(db, 'songs'),
      where('genre', '==', genre),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  async getPopular(limitCount = 10) {
    const q = query(
      collection(db, 'songs'),
      orderBy('playCount', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },
  
  getById: async (songId) => {
    try {
      const songDoc = await getDoc(doc(db, 'songs', songId));
      if (songDoc.exists()) {
        return { id: songDoc.id, ...songDoc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error fetching song by ID:', error);
      throw error;
    }
  },

  async getRecent(limitCount = 10) {
    const q = query(
      collection(db, 'songs'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
};

// Playlists API
export const playlistsAPI = {
  async getAll() {
    const snapshot = await getDocs(collection(db, 'playlists'));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  async getById(id) {
    const docRef = doc(db, 'playlists', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;

    const playlistData = { id: docSnap.id, ...docSnap.data() };

    // Fetch song details for each song ID in the playlist
    if (playlistData.songIds && playlistData.songIds.length > 0) {
      const songPromises = playlistData.songIds.map(songId =>
        songsAPI.getById(songId)
      );
      const songs = await Promise.all(songPromises);
      playlistData.songs = songs.filter(song => song !== null);
    } else {
      playlistData.songs = [];
    }

    return playlistData;
  },

  async create(playlistData) {
    const docRef = await addDoc(collection(db, 'playlists'), {
      ...playlistData,
      songIds: playlistData.songIds || [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  },

  async update(id, updates) {
    const docRef = doc(db, 'playlists', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date()
    });
  },

  async delete(id) {
    const docRef = doc(db, 'playlists', id);
    await deleteDoc(docRef);
  },

  async addSong(playlistId, songId) {
    const docRef = doc(db, 'playlists', playlistId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const currentSongIds = docSnap.data().songIds || [];
      if (!currentSongIds.includes(songId)) {
        await updateDoc(docRef, {
          songIds: [...currentSongIds, songId],
          updatedAt: new Date()
        });
      }
    }
  },

  async removeSong(playlistId, songId) {
    const docRef = doc(db, 'playlists', playlistId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const currentSongIds = docSnap.data().songIds || [];
      const updatedSongIds = currentSongIds.filter(id => id !== songId);
      await updateDoc(docRef, {
        songIds: updatedSongIds,
        updatedAt: new Date()
      });
    }
  }
};
