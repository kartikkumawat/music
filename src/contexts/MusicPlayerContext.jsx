import React, { createContext, useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { songsAPI } from '../services/api';

export const MusicPlayerContext = createContext();

const MusicPlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off');
  const [showPlayer, setShowPlayer] = useState(false);

  const audioRef = useRef(new Audio());
  const processingRef = useRef(false);

  // Stable context value - only changes when these specific values change
  const contextValue = useMemo(() => ({
    currentSong,
    isPlaying,
    volume,
    playlist,
    currentIndex,
    isLoading,
    isShuffled,
    repeatMode,
    showPlayer,
    audioRef,
    processingRef,
    setCurrentSong,
    setIsPlaying,
    setVolume,
    setPlaylist,
    setCurrentIndex,
    setIsLoading,
    setIsShuffled,
    setRepeatMode,
    setShowPlayer,
  }), [
    currentSong,
    isPlaying,
    volume,
    playlist,
    currentIndex,
    isLoading,
    isShuffled,
    repeatMode,
    showPlayer,
  ]);

  return (
    <MusicPlayerContext.Provider value={contextValue}>
      {children}
    </MusicPlayerContext.Provider>
  );
};

MusicPlayerProvider.displayName = 'MusicPlayerProvider';
export { MusicPlayerProvider };
