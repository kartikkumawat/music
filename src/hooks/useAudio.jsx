import { useState, useEffect, useRef, useCallback } from 'react';

export const useAudio = (src, options = {}) => {
  const {
    autoPlay = false,
    loop = false,
    muted = false,
    volume = 1,
    onLoadedData,
    onPlay,
    onPause,
    onEnded,
    onError,
    onTimeUpdate
  } = options;

  const [audio] = useState(() => new Audio(src));
  const [state, setState] = useState({
    duration: 0,
    currentTime: 0,
    playing: false,
    muted: muted,
    volume: volume,
    loading: false,
    error: null
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  // Update audio properties when options change
  useEffect(() => {
    audio.loop = loop;
    audio.muted = muted;
    audio.volume = volume;
    if (autoPlay) {
      audio.play().catch(console.error);
    }
  }, [audio, autoPlay, loop, muted, volume]);

  // Set up event listeners
  useEffect(() => {
    const setAudioData = () => {
      setState(prev => ({
        ...prev,
        duration: audio.duration,
        loading: false
      }));
      onLoadedData?.();
    };

    const setAudioTime = () => {
      setState(prev => ({
        ...prev,
        currentTime: audio.currentTime
      }));
      onTimeUpdate?.(audio.currentTime);
    };

    const handlePlay = () => {
      setState(prev => ({ ...prev, playing: true }));
      onPlay?.();
    };

    const handlePause = () => {
      setState(prev => ({ ...prev, playing: false }));
      onPause?.();
    };

    const handleEnded = () => {
      setState(prev => ({ ...prev, playing: false, currentTime: 0 }));
      onEnded?.();
    };

    const handleError = (event) => {
      setState(prev => ({
        ...prev,
        error: audio.error,
        loading: false
      }));
      onError?.(audio.error);
    };

    const handleLoadStart = () => {
      setState(prev => ({ ...prev, loading: true }));
    };

    const handleCanPlay = () => {
      setState(prev => ({ ...prev, loading: false }));
    };

    // Add event listeners
    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      // Remove event listeners
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [audio, onLoadedData, onPlay, onPause, onEnded, onError, onTimeUpdate]);

  // Audio control methods
  const controls = {
    play: useCallback(() => {
      return audio.play().catch(error => {
        setState(prev => ({ ...prev, error }));
        throw error;
      });
    }, [audio]),

    pause: useCallback(() => {
      audio.pause();
    }, [audio]),

    seek: useCallback((time) => {
      audio.currentTime = time;
    }, [audio]),

    setVolume: useCallback((vol) => {
      const volume = Math.max(0, Math.min(1, vol));
      audio.volume = volume;
      setState(prev => ({ ...prev, volume }));
    }, [audio]),

    mute: useCallback(() => {
      audio.muted = true;
      setState(prev => ({ ...prev, muted: true }));
    }, [audio]),

    unmute: useCallback(() => {
      audio.muted = false;
      setState(prev => ({ ...prev, muted: false }));
    }, [audio]),

    toggleMute: useCallback(() => {
      const muted = !audio.muted;
      audio.muted = muted;
      setState(prev => ({ ...prev, muted }));
    }, [audio]),

    setSrc: useCallback((newSrc) => {
      audio.src = newSrc;
      setState(prev => ({
        ...prev,
        currentTime: 0,
        duration: 0,
        loading: true
      }));
    }, [audio])
  };

  return [state, controls, audio];
};

export default useAudio;
