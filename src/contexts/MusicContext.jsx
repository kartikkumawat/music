import React, { createContext, useState, useRef, useEffect, useMemo } from 'react';
import { songsAPI } from '../services/api';

// Export the context for the hook to use
export const MusicContext = createContext();

const MusicProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off');

  const audioRef = useRef(new Audio());
  const processingRef = useRef(false);
  const lastUpdateRef = useRef(0);

  useEffect(() => {
    const audio = audioRef.current;

    const updateTime = () => {
      const now = Date.now();
      if (now - lastUpdateRef.current > 100) {
        setCurrentTime(audio.currentTime);
        lastUpdateRef.current = now;
      }
    };

    const updateDuration = () => setDuration(audio.duration);
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);

    const handlePlay = () => {
      if (!processingRef.current) {
        setIsPlaying(true);
        setIsLoading(false);
      }
    };

    const handlePause = () => {
      if (!processingRef.current) {
        setIsPlaying(false);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      handleSongEnd();
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const handleSongEnd = () => {
    if (repeatMode === 'one') {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else if (repeatMode === 'all' || currentIndex < playlist.length - 1) {
      nextSong();
    } else {
      setIsPlaying(false);
    }
  };

  const playSong = async (song, songPlaylist = []) => {
    if (processingRef.current) return;

    processingRef.current = true;

    try {
      const audio = audioRef.current;

      if (currentSong?.id === song.id) {
        if (isPlaying) {
          audio.pause();
        } else {
          await audio.play();
        }
      } else {
        setCurrentSong(song);
        setPlaylist(songPlaylist);
        const index = songPlaylist.findIndex(s => s.id === song.id);
        setCurrentIndex(index >= 0 ? index : 0);

        audio.src = song.audioUrl;
        audio.volume = volume;

        await audio.play();

        try {
          await songsAPI.incrementPlayCount(song.id);
        } catch (error) {
          console.warn('Failed to increment play count:', error);
        }
      }
    } catch (error) {
      console.error('Play error:', error);
      setIsPlaying(false);
    } finally {
      setTimeout(() => {
        processingRef.current = false;
      }, 200);
    }
  };

  const pauseSong = () => {
    if (processingRef.current) return;
    audioRef.current.pause();
  };

  const nextSong = () => {
    if (playlist.length === 0 || processingRef.current) return;

    let nextIndex;
    if (isShuffled) {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else {
      nextIndex = currentIndex + 1;
      if (nextIndex >= playlist.length) {
        nextIndex = repeatMode === 'all' ? 0 : playlist.length - 1;
      }
    }

    if (nextIndex !== currentIndex || repeatMode === 'all') {
      setCurrentIndex(nextIndex);
      playSong(playlist[nextIndex], playlist);
    }
  };

  const previousSong = () => {
    if (playlist.length === 0 || processingRef.current) return;

    let prevIndex;
    if (isShuffled) {
      prevIndex = Math.floor(Math.random() * playlist.length);
    } else {
      prevIndex = currentIndex - 1;
      if (prevIndex < 0) {
        prevIndex = repeatMode === 'all' ? playlist.length - 1 : 0;
      }
    }

    if (prevIndex !== currentIndex || repeatMode === 'all') {
      setCurrentIndex(prevIndex);
      playSong(playlist[prevIndex], playlist);
    }
  };

  const seekTo = (time) => {
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const changeVolume = (newVolume) => {
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
  };

  const toggleShuffle = () => {
    setIsShuffled(!isShuffled);
  };

  const toggleRepeat = () => {
    const modes = ['off', 'all', 'one'];
    const currentModeIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentModeIndex + 1) % modes.length];
    setRepeatMode(nextMode);
  };

   const value = useMemo(() => ({
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    playlist,
    currentIndex,
    isLoading,
    isShuffled,
    repeatMode,
    playSong,
    pauseSong,
    nextSong,
    previousSong,
    seekTo,
    changeVolume,
    toggleShuffle,
    toggleRepeat
  }), [
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    playlist,
    currentIndex,
    isLoading,
    isShuffled,
    repeatMode
  ]);

  return (
    <MusicContext.Provider value={value}>
      {children}
    </MusicContext.Provider>
  );
};

MusicProvider.displayName = 'MusicProvider';

// Export as named export
export { MusicProvider };
