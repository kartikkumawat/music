import React, { createContext, useCallback, useEffect, useContext, useMemo } from 'react';
import { MusicPlayerContext } from './MusicPlayerContext';
import { MusicTimeContext } from './MusicTimeContext';
import { songsAPI } from '../services/api';

export const MusicActionsContext = createContext();

const MusicActionsProvider = ({ children }) => {
  const {
    currentSong, setCurrentSong,
    isPlaying, setIsPlaying,
    volume, setVolume,
    playlist, setPlaylist,
    currentIndex, setCurrentIndex,
    setIsLoading,
    isShuffled, setIsShuffled,
    repeatMode, setRepeatMode,
    setShowPlayer,
    audioRef,
    processingRef,
  } = useContext(MusicPlayerContext);

  // Add this useEffect in MusicActionsProvider
    useEffect(() => {
    const audio = audioRef.current;
    const syncState = () => {
        if (!processingRef.current) {
        setIsPlaying(!audio.paused);
        }
    };

    // Check state every 100ms
    const interval = setInterval(syncState, 100);

    return () => clearInterval(interval);
    }, [audioRef, setIsPlaying]);

  const { setCurrentTime } = useContext(MusicTimeContext);

  // All callback functions - these are stable references
  const handleSongEnd = useCallback(() => {
    if (repeatMode === 'one') {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else if (repeatMode === 'all') {
      setCurrentIndex(prev => (prev + 1) % playlist.length);
    } else if (currentIndex < playlist.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsPlaying(false);
    }
  }, [repeatMode, currentIndex, playlist.length, audioRef, setCurrentIndex, setIsPlaying]);

  const seekTo = useCallback((time) => {
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  }, [audioRef, setCurrentTime]);

  const changeVolume = useCallback((newVolume) => {
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
  }, [audioRef, setVolume]);

  const toggleShuffle = useCallback(() => {
    setIsShuffled(prev => !prev);
  }, [setIsShuffled]);

  const toggleRepeat = useCallback(() => {
    setRepeatMode(prev => {
      const modes = ['off', 'all', 'one'];
      const currentModeIndex = modes.indexOf(prev);
      return modes[(currentModeIndex + 1) % modes.length];
    });
  }, [setRepeatMode]);

  const closeMusicPlayer = useCallback(() => {
    setShowPlayer(false);
    audioRef.current.pause();
  }, [audioRef, setShowPlayer]);

  const shareSong = useCallback(async (song) => {
    const shareUrl = `${window.location.origin}/song/${song.id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: song.title,
          text: `Check out "${song.title}" by ${song.artist}`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        console.log('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }, []);

 const playSong = useCallback(async (song, songPlaylist = []) => {
  if (processingRef.current) return;
  processingRef.current = true;

  try {
    const audio = audioRef.current;

    if (currentSong?.id === song.id) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false); // Direct state update
      } else {
        await audio.play();
        setIsPlaying(true); // Direct state update
      }
    } else {
      // Existing new song logic...
      setCurrentSong(song);
      setShowPlayer(true);

      if (JSON.stringify(songPlaylist.map(s => s.id)) !== JSON.stringify(playlist.map(s => s.id))) {
        setPlaylist(songPlaylist);
      }

      const index = songPlaylist.findIndex(s => s.id === song.id);
      setCurrentIndex(index >= 0 ? index : 0);

      audio.src = song.audioUrl;
      audio.volume = volume;
      await audio.play();
      setIsPlaying(true); // Direct state update

      songsAPI.incrementPlayCount(song.id).catch(error =>
        console.warn('Failed to increment play count:', error)
      );
    }
  } catch (error) {
    console.error('Play error:', error);
    setIsPlaying(false);
  } finally {
    setTimeout(() => {
      processingRef.current = false;
    }, 100); // Reduced from 200ms to 100ms
  }
}, [currentSong?.id, isPlaying, volume, playlist, audioRef, processingRef, setCurrentSong, setShowPlayer, setPlaylist, setCurrentIndex, setIsPlaying]);

  const pauseSong = useCallback(() => {
    if (processingRef.current) return;
    audioRef.current.pause();
  }, [audioRef, processingRef]);

  const nextSong = useCallback(() => {
    if (playlist.length === 0 || processingRef.current) return;

    if (isShuffled) {
      const randomIndex = Math.floor(Math.random() * playlist.length);
      setCurrentIndex(randomIndex);
    } else {
      setCurrentIndex(prev => {
        const nextIndex = prev + 1;
        if (nextIndex >= playlist.length) {
          return repeatMode === 'all' ? 0 : prev;
        }
        return nextIndex;
      });
    }
  }, [playlist.length, isShuffled, repeatMode, processingRef, setCurrentIndex]);

  const previousSong = useCallback(() => {
    if (playlist.length === 0 || processingRef.current) return;

    if (isShuffled) {
      const randomIndex = Math.floor(Math.random() * playlist.length);
      setCurrentIndex(randomIndex);
    } else {
      setCurrentIndex(prev => {
        const prevIndex = prev - 1;
        if (prevIndex < 0) {
          return repeatMode === 'all' ? playlist.length - 1 : 0;
        }
        return prevIndex;
      });
    }
  }, [playlist.length, isShuffled, repeatMode, processingRef, setCurrentIndex]);

  // Set up audio event listeners
  useEffect(() => {
    const audio = audioRef.current;

    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);

    const handlePlay = () => {
    setIsPlaying(true);
    setIsLoading(false);
    };

    const handlePause = () => {
    setIsPlaying(false);
    };

    const handleEnded = () => {
    setIsPlaying(false);
    handleSongEnd();
    };

    const handleError = () => {
      setIsPlaying(false);
      setIsLoading(false);
      console.error('Audio playback error');
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [handleSongEnd, setIsPlaying, setIsLoading, audioRef, processingRef]);

  // Effect to handle song changes when currentIndex changes
  useEffect(() => {
    if (playlist.length > 0 && currentIndex >= 0 && currentIndex < playlist.length) {
      const newSong = playlist[currentIndex];
      if (newSong && currentSong?.id !== newSong.id) {
        playSong(newSong, playlist);
      }
    }
  }, [currentIndex, playlist, currentSong?.id, playSong]);

  // Stable actions object
  const actions = useMemo(() => ({
    playSong,
    pauseSong,
    nextSong,
    previousSong,
    seekTo,
    changeVolume,
    toggleShuffle,
    toggleRepeat,
    closeMusicPlayer,
    shareSong,
  }), [
    playSong,
    pauseSong,
    nextSong,
    previousSong,
    seekTo,
    changeVolume,
    toggleShuffle,
    toggleRepeat,
    closeMusicPlayer,
    shareSong,
  ]);

  return (
    <MusicActionsContext.Provider value={actions}>
      {children}
    </MusicActionsContext.Provider>
  );
};

MusicActionsProvider.displayName = 'MusicActionsProvider';
export { MusicActionsProvider };
