import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

const MusicContext = createContext();

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within MusicProvider');
  }
  return context;
};

export const MusicProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const audioRef = useRef(new Audio());

  useEffect(() => {
    const audio = audioRef.current;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', nextSong);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', nextSong);
    };
  }, []);

  const playSong = (song, songPlaylist = []) => {
    const audio = audioRef.current;
    
    if (currentSong?.id === song.id) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play();
        setIsPlaying(true);
      }
    } else {
      setCurrentSong(song);
      setPlaylist(songPlaylist);
      const index = songPlaylist.findIndex(s => s.id === song.id);
      setCurrentIndex(index >= 0 ? index : 0);
      
      audio.src = song.audioUrl;
      audio.volume = volume;
      audio.play();
      setIsPlaying(true);
    }
  };

  const pauseSong = () => {
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const nextSong = () => {
    if (playlist.length > 0 && currentIndex < playlist.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      playSong(playlist[nextIndex], playlist);
    }
  };

  const previousSong = () => {
    if (playlist.length > 0 && currentIndex > 0) {
      const prevIndex = currentIndex - 1;
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

  const value = {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    playlist,
    currentIndex,
    playSong,
    pauseSong,
    nextSong,
    previousSong,
    seekTo,
    changeVolume
  };

  return (
    <MusicContext.Provider value={value}>
      {children}
    </MusicContext.Provider>
  );
};